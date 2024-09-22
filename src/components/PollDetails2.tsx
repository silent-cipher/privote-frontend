import Image from "next/image";
import styles from "~~/styles/userPoll.module.css";
import { genRandomSalt } from "maci-crypto";
import { useContractWrite, useContractRead } from "wagmi";
import PollAbi from "~~/abi/Poll";
import { useFetchPoll } from "~~/hooks/useFetchPoll";
import { useState, useEffect } from "react";
import { PollType, PollStatus } from "~~/types/poll";
import { useAuthContext } from "~~/contexts/AuthContext";
import Link from "next/link";
import { Keypair, PCommand, PubKey } from "maci-domainobjs";
import { getDataFromPinata } from "~~/utils/pinata";
import { getPollStatus } from "~~/hooks/useFetchPolls";
import VoteCard from "./Poll/VoteCard";
import { notification } from "~~/utils/scaffold-eth";
import { useAccount } from "wagmi";
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";

const PollStatusMapping = {
  [PollStatus.NOT_STARTED]: "Not Started",
  [PollStatus.OPEN]: "Live",
  [PollStatus.CLOSED]: "Pole ended",
  [PollStatus.RESULT_COMPUTED]: "Pole ended",
};

const PollDetails2 = ({ id }: { id: bigint }) => {
  const { data: poll, error, isLoading } = useFetchPoll(id);
  const [pollType, setPollType] = useState(PollType.NOT_SELECTED);
  const { address } = useAccount();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
  const [AnonAadhaar] = useAnonAadhaar();

  const { keypair, stateIndex } = useAuthContext();

  const [votes, setVotes] = useState<{ index: number; votes: number }[]>([]);

  const [isVotesInvalid, setIsVotesInvalid] = useState<Record<number, boolean>>(
    {}
  );

  const isAnyInvalid = Object.values(isVotesInvalid).some((v) => v);
  const [result, setResult] = useState<
    { candidate: string; votes: number }[] | null
  >(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [status, setStatus] = useState<PollStatus>();

  console.log(result);
  useEffect(() => {
    if (!poll || !poll.metadata) {
      return;
    }

    try {
      const { pollType } = JSON.parse(poll.metadata);
      setPollType(pollType);
    } catch (err) {
      console.log("err", err);
    }

    if (poll.tallyJsonCID) {
      (async () => {
        try {
          console.log(poll.tallyJsonCID);
          const response = await getDataFromPinata(poll.tallyJsonCID);
          //   const {
          //     results: { tally },
          //   } = await getDataFromPinata(poll.tallyJsonCID);
          console.log(response);
          const {
            results: { tally },
          } = response;
          if (poll.options.length > tally.length) {
            throw new Error("Invalid tally data");
          }
          const tallyCounts: number[] = tally
            .map((v: string) => Number(v))
            .slice(0, poll.options.length);
          const result = [];
          for (let i = 0; i < poll.options.length; i++) {
            const candidate = poll.options[i];
            const votes = tallyCounts[i];
            result.push({ candidate, votes });
          }
          result.sort((a, b) => b.votes - a.votes);
          let totalVotes = 0;
          result.reduce((acc, cur) => {
            totalVotes += cur.votes;
            return acc;
          }, 0);
          setTotalVotes(totalVotes);
          setResult(result);

          console.log("data", result);
        } catch (err) {
          console.log("err", err);
        }
      })();
    }

    const statusUpdateInterval = setInterval(async () => {
      setStatus(getPollStatus(poll));
    }, 1000);

    return () => {
      clearInterval(statusUpdateInterval);
    };
  }, [poll]);

  const { data: coordinatorPubKeyResult } = useContractRead({
    abi: PollAbi,
    address: poll?.pollContracts.poll,
    functionName: "coordinatorPubKey",
  });

  const { writeAsync: publishMessage, isLoading: isLoadingSingle } =
    useContractWrite({
      abi: PollAbi,
      address: poll?.pollContracts.poll,
      functionName: "publishMessage",
    });

  const { writeAsync: publishMessageBatch, isLoading: isLoadingBatch } =
    useContractWrite({
      abi: PollAbi,
      address: poll?.pollContracts.poll,
      functionName: "publishMessageBatch",
    });

  const [coordinatorPubKey, setCoordinatorPubKey] = useState<PubKey>();

  useEffect(() => {
    if (!coordinatorPubKeyResult) {
      return;
    }

    const coordinatorPubKey_ = new PubKey([
      BigInt((coordinatorPubKeyResult as any)[0].toString()),
      BigInt((coordinatorPubKeyResult as any)[1].toString()),
    ]);

    setCoordinatorPubKey(coordinatorPubKey_);
  }, [coordinatorPubKeyResult]);

  const castVote = async () => {
    if (!poll || stateIndex == null || !coordinatorPubKey || !keypair) return;

    // check if the votes are valid
    if (isAnyInvalid) {
      notification.error("Please enter a valid number of votes");
      return;
    }

    // check if no votes are selected
    if (votes.length === 0) {
      notification.error("Please select at least one option to vote");
      return;
    }

    // check if the poll is closed
    if (status !== PollStatus.OPEN) {
      notification.error("Voting is closed for this poll");
      return;
    }

    const votesToMessage = votes.map((v, i) =>
      getMessageAndEncKeyPair(
        stateIndex,
        poll.id,
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
      console.log("err", err);
      notification.error("Casting vote failed, please try again ");
    }
  };

  function getMessageAndEncKeyPair(
    stateIndex: bigint,
    pollIndex: bigint,
    candidateIndex: bigint,
    weight: bigint,
    nonce: bigint,
    coordinatorPubKey: PubKey,
    keypair: Keypair
  ) {
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
  }

  function voteUpdated(index: number, checked: boolean, voteCounts: number) {
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
  }

  if (error) return <div>Poll not found</div>;

  if (isLoading)
    return (
      <div className={styles.container}>
        <div className={"spinner-wrapper"}>
          <span className="spinner large"></span>
        </div>
      </div>
    );

  return (
    <div className={styles.container}>
      <Link href={"/"} className={styles.back}>
        <Image src="/arrow-left.svg" alt="arrow left" width={27} height={27} />
      </Link>
      <div className={styles.details}>
        <div className={styles.header}>
          <h1 className={styles.heading}>{poll?.name}</h1>
          <div className={styles.end}>
            {poll?.authType === "anon" &&
              AnonAadhaar.status === "logged-out" && (
                <LogInWithAnonAadhaar nullifierSeed={1234} />
              )}
            {poll?.authType === "anon" &&
              AnonAadhaar.status === "logging-in" && <p>Logging in....</p>}
            <div className={styles.status}>
              {status ? PollStatusMapping[status] : ""}
            </div>
          </div>
        </div>

        <div className={styles["candidate-container"]}>
          <ul className={styles["candidate-list"]}>
            {poll?.options.map((option: string, index: number) => (
              <VoteCard
                pollOpen={status === PollStatus.OPEN}
                title={option}
                index={index}
                pollStatus={status}
                description={
                  option.toLowerCase() === "kamala harris"
                    ? "Democrat"
                    : "Republican"
                }
                image={
                  option.toLowerCase() === "kamala harris"
                    ? "/kamala.svg"
                    : "/trump.svg"
                }
                result={result?.find((r) => r.candidate === option)}
                totalVotes={2}
                isWinner={result?.[0]?.candidate === option}
                clicked={false}
                pollType={pollType}
                onChange={(checked, votes) =>
                  voteUpdated(index, checked, votes)
                }
                isInvalid={Boolean(isVotesInvalid[index])}
                setIsInvalid={(status) =>
                  setIsVotesInvalid({ ...isVotesInvalid, [index]: status })
                }
                onVote={castVote}
                isSelected={selectedCandidate === index}
                setSelectedCandidate={setSelectedCandidate}
              />
            ))}
          </ul>
          {status === PollStatus.OPEN &&
            poll?.authType === "anon" &&
            AnonAadhaar.status === "logged-out" && (
              <div className={styles.text}>Please login to vote</div>
            )}
          {status === PollStatus.OPEN && (
            <button
              className={styles["poll-btn"]}
              disabled={
                poll?.authType === "anon"
                  ? AnonAadhaar.status !== "logged-in"
                  : false
              }
              onClick={castVote}
            >
              {isLoadingSingle || isLoadingBatch ? (
                <span className={`${styles.spinner} spinner`}></span>
              ) : (
                <p>Vote Now</p>
              )}
            </button>
          )}
          {status === PollStatus.CLOSED && address === poll.pollDeployer && (
            <Link
              className={styles["poll-btn"]}
              href={`/polls/${poll.id}/publish`}
            >
              <p>Publish Result</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetails2;
