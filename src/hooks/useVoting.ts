import { useState } from "react";
import { useContractWrite } from "wagmi";
import { PCommand, Keypair, PubKey } from "maci-domainobjs";
import { genRandomSalt } from "maci-crypto";
import { notification } from "~~/utils/scaffold-eth";
import { PollType, PollStatus } from "~~/types/poll";
import PollAbi from "~~/abi/Poll";

interface UseVotingProps {
  pollAddress?: string;
  pollType: PollType;
  status?: PollStatus;
  stateIndex: number | null;
  coordinatorPubKey?: PubKey;
  keypair?: Keypair | null;
  pollId?: bigint;
}

export const useVoting = ({
  pollAddress,
  pollType,
  status,
  stateIndex,
  coordinatorPubKey,
  keypair,
  pollId,
}: UseVotingProps) => {
  const [votes, setVotes] = useState<{ index: number; votes: number }[]>([]);
  const [isVotesInvalid, setIsVotesInvalid] = useState<Record<number, boolean>>(
    {}
  );
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );

  const { writeAsync: publishMessage, isLoading: isLoadingSingle } =
    useContractWrite({
      abi: PollAbi,
      address: pollAddress,
      functionName: "publishMessage",
    });

  const { writeAsync: publishMessageBatch, isLoading: isLoadingBatch } =
    useContractWrite({
      abi: PollAbi,
      address: pollAddress,
      functionName: "publishMessageBatch",
    });

  const getMessageAndEncKeyPair = (
    stateIndex: bigint,
    pollIndex: bigint,
    candidateIndex: bigint,
    weight: bigint,
    nonce: bigint,
    coordinatorPubKey: PubKey,
    keypair: Keypair
  ) => {
    const command: PCommand = new PCommand(
      stateIndex,
      keypair.pubKey,
      candidateIndex,
      weight,
      nonce,
      pollIndex,
      genRandomSalt()
    );

    const signature = command.sign(keypair.privKey);
    const encKeyPair = new Keypair();
    const message = command.encrypt(
      signature,
      Keypair.genEcdhSharedKey(encKeyPair.privKey, coordinatorPubKey)
    );

    return { message, encKeyPair };
  };

  const voteUpdated = (index: number, checked: boolean, voteCounts: number) => {
    if (pollType === PollType.SINGLE_VOTE) {
      if (checked) {
        setVotes([{ index, votes: voteCounts }]);
      }
      return;
    }

    if (checked) {
      setVotes([
        ...votes.filter((v) => v.index !== index),
        { index, votes: voteCounts },
      ]);
    } else {
      setVotes(votes.filter((v) => v.index !== index));
    }
  };

  const castVote = async () => {
    if (!pollId || stateIndex == null || !coordinatorPubKey || !keypair) return;

    if (Object.values(isVotesInvalid).some((v) => v)) {
      notification.error("Please enter a valid number of votes");
      return;
    }

    if (votes.length === 0) {
      notification.error("Please select at least one option to vote");
      return;
    }

    if (status !== PollStatus.OPEN) {
      notification.error("Voting is closed for this poll");
      return;
    }

    const votesToMessage = votes.map((v, i) =>
      getMessageAndEncKeyPair(
        BigInt(stateIndex),
        pollId,
        BigInt(v.index),
        BigInt(v.votes),
        BigInt(votes.length - i),
        coordinatorPubKey,
        keypair
      )
    );

    try {
      if (votesToMessage.length === 1) {
        await publishMessage({
          args: [
            votesToMessage[0].message.asContractParam() as unknown as {
              data: readonly [
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint,
                bigint
              ];
            },
            votesToMessage[0].encKeyPair.pubKey.asContractParam() as unknown as {
              x: bigint;
              y: bigint;
            },
          ],
        });
        setSelectedCandidate(null);
      } else {
        await publishMessageBatch({
          args: [
            votesToMessage.map(
              (v) =>
                v.message.asContractParam() as unknown as {
                  data: readonly [
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint,
                    bigint
                  ];
                }
            ),
            votesToMessage.map(
              (v) =>
                v.encKeyPair.pubKey.asContractParam() as {
                  x: bigint;
                  y: bigint;
                }
            ),
          ],
        });
        setSelectedCandidate(null);
      }

      notification.success("Vote casted successfully");
    } catch (err) {
      console.error("err", err);
      notification.error("Casting vote failed, please try again");
    }
  };

  return {
    votes,
    isVotesInvalid,
    selectedCandidate,
    isLoadingSingle,
    isLoadingBatch,
    setIsVotesInvalid,
    setSelectedCandidate,
    voteUpdated,
    castVote,
  };
};

export default useVoting;
