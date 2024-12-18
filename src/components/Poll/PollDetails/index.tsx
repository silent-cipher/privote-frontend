import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import { useAccount } from "wagmi";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import { PubKey } from "maci-domainobjs";
import styles from "~~/styles/userPoll.module.css";
import PollAbi from "~~/abi/Poll";
import { useFetchPoll } from "~~/hooks/useFetchPoll";
import { PollType, PollStatus } from "~~/types/poll";
import { useAuthContext } from "~~/contexts/AuthContext";
import { getDataFromPinata } from "~~/utils/pinata";
import { getPollStatus } from "~~/hooks/useFetchPolls";
import useUserRegister from "~~/hooks/useUserRegister";
import useVoting from "~~/hooks/useVoting";
import PollHeader from "../PollHeader";
import VotingSection from "../VotingSection";

interface IPollDetails {
  id: bigint;
  isUserRegistered: boolean;
}

interface IResult {
  candidate: string;
  votes: number;
}

const PollDetails = ({ id, isUserRegistered }: IPollDetails) => {
  const { data: poll, error, isLoading } = useFetchPoll(id);
  const [pollType, setPollType] = useState(PollType.NOT_SELECTED);
  const { address, isConnected } = useAccount();
  const { registerUser } = useUserRegister();
  const [AnonAadhaar] = useAnonAadhaar();
  const { keypair, stateIndex } = useAuthContext();
  const [result, setResult] = useState<IResult[] | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [status, setStatus] = useState<PollStatus>();
  const [coordinatorPubKey, setCoordinatorPubKey] = useState<PubKey>();

  const { data: coordinatorPubKeyResult } = useContractRead({
    abi: PollAbi,
    address: poll?.pollContracts.poll,
    functionName: "coordinatorPubKey",
  });

  const {
    isVotesInvalid,
    selectedCandidate,
    isLoadingSingle,
    isLoadingBatch,
    setIsVotesInvalid,
    setSelectedCandidate,
    voteUpdated,
    castVote,
  } = useVoting({
    pollAddress: poll?.pollContracts.poll,
    pollType,
    status,
    coordinatorPubKey,
    keypair,
    pollId: id,
    stateIndex: Number(stateIndex),
  });

  useEffect(() => {
    if (!poll || !poll.metadata) return;

    try {
      const { pollType } = JSON.parse(poll.metadata);
      setPollType(pollType);
    } catch (err) {
      console.error("Error parsing poll metadata:", err);
    }

    if (poll.tallyJsonCID) {
      (async () => {
        try {
          const response = await getDataFromPinata(poll.tallyJsonCID);
          const {
            results: { tally },
          } = response;

          if (poll.options.length > tally.length) {
            throw new Error("Invalid tally data");
          }

          const tallyCounts: number[] = tally
            .map((v: string) => Number(v))
            .slice(0, poll.options.length);

          const result = poll.options.map((candidate: string, i: number) => ({
            candidate,
            votes: tallyCounts[i],
          }));

          result.sort((a: IResult, b: IResult) => b.votes - a.votes);
          const totalVotes = result.reduce(
            (acc: number, cur: IResult) => acc + cur.votes,
            0
          );

          setTotalVotes(totalVotes);
          setResult(result);
        } catch (err) {
          console.error("Error fetching tally data:", err);
        }
      })();
    }

    const statusUpdateInterval = setInterval(() => {
      setStatus(getPollStatus(poll));
    }, 1000);

    return () => clearInterval(statusUpdateInterval);
  }, [poll]);

  useEffect(() => {
    if (!coordinatorPubKeyResult) return;

    const coordinatorPubKey_ = new PubKey([
      BigInt((coordinatorPubKeyResult as any)[0].toString()),
      BigInt((coordinatorPubKeyResult as any)[1].toString()),
    ]);

    setCoordinatorPubKey(coordinatorPubKey_);
  }, [coordinatorPubKeyResult]);

  if (error) return <div>Poll not found</div>;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={"spinner-wrapper"}>
          <span className="spinner large"></span>
        </div>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className={styles.details}>
      <PollHeader
        pollName={poll.name}
        status={status}
        isConnected={isConnected}
        isUserRegistered={isUserRegistered}
        anonAadhaarStatus={AnonAadhaar.status}
        onRegister={registerUser}
      />

      <VotingSection
        pollId={id}
        pollStatus={status}
        pollType={pollType}
        options={poll.options}
        optionInfo={poll.optionInfo}
        pollDeployer={poll.pollDeployer}
        userAddress={address}
        isConnected={isConnected}
        isUserRegistered={isUserRegistered}
        result={result}
        totalVotes={totalVotes}
        isVotesInvalid={isVotesInvalid}
        selectedCandidate={selectedCandidate}
        isLoadingSingle={isLoadingSingle}
        isLoadingBatch={isLoadingBatch}
        onVoteUpdate={voteUpdated}
        setIsVotesInvalid={setIsVotesInvalid}
        setSelectedCandidate={setSelectedCandidate}
        onVote={castVote}
      />
    </div>
  );
};

export default PollDetails;
