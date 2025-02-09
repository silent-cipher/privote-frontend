import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import { useAccount } from "wagmi";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import { PubKey } from "maci-domainobjs";
import styles from "~~/styles/userPoll.module.css";
import PollAbi from "~~/abi/Poll";
import { PollType, AuthType, PollStatus } from "~~/types/poll";
import { usePollContext } from "~~/contexts/PollContext";
import { getPollStatus } from "~~/hooks/useFetchPolls";
import useUserRegister from "~~/hooks/useUserRegister";
import useVoting from "~~/hooks/useVoting";
import usePollResults from "~~/hooks/usePollResults";
import PollHeader from "../PollHeader";
import VotingSection from "../VotingSection";
import Button from "~~/components/ui/Button";
import { useSigContext } from "~~/contexts/SigContext";
import { useSearchParams } from "next/navigation";
import { EMode } from "~~/types/poll";

interface IPollDetails {
  id: bigint;
  isUserRegistered: boolean;
}

const PollDetails = ({ id, isUserRegistered }: IPollDetails) => {
  const [pollMetadata, setPollMetadata] = useState<{
    pollType: PollType;
    description?: string;
    maxVotePerPerson?: number;
  }>({
    pollType: PollType.NOT_SELECTED,
  });
  const searchParams = useSearchParams();
  const authType = (searchParams.get("authType") as AuthType) || "free";
  const pollType =
    (Number(searchParams.get("pollType")) as PollType) || PollType.SINGLE_VOTE;
  const { address, isConnected } = useAccount();
  const [AnonAadhaar] = useAnonAadhaar();
  const {
    stateIndex,
    poll,
    isLoading: isPollLoading,
    isError: pollError,
  } = usePollContext();
  const { keypair } = useSigContext();
  const { registerUser, isLoading: isRegistering } = useUserRegister(
    authType,
    pollType
  );
  const [status, setStatus] = useState<PollStatus>();
  const [coordinatorPubKey, setCoordinatorPubKey] = useState<PubKey>();
  const {
    result,
    totalVotes,
    isLoading: isResultsLoading,
    error: resultsError,
  } = usePollResults(poll, authType, pollType);

  const { data: coordinatorPubKeyResult } = useContractRead({
    abi: PollAbi,
    address: poll?.pollContracts.poll,
    functionName: "coordinatorPubKey",
  });

  const {
    votes,
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
    mode: poll?.isQv as EMode,
    pollType: pollMetadata.pollType,
    status,
    coordinatorPubKey,
    keypair,
    pollId: id,
    stateIndex: Number(stateIndex),
    maxVotePerPerson: pollMetadata.maxVotePerPerson,
  });

  useEffect(() => {
    if (!poll || !poll.metadata) return;

    try {
      const { pollType, description, maxVotePerPerson } = JSON.parse(
        poll.metadata
      );
      setPollMetadata({
        pollType: pollType as PollType,
        description,
        maxVotePerPerson,
      });
    } catch (err) {
      console.error("Error parsing poll metadata:", err);
    }
  }, [poll]);

  useEffect(() => {
    if (!coordinatorPubKeyResult) return;
    try {
      const pubKey = new PubKey([
        BigInt((coordinatorPubKeyResult as any)[0].toString()),
        BigInt((coordinatorPubKeyResult as any)[1].toString()),
      ]);
      setCoordinatorPubKey(pubKey);
    } catch (err) {
      console.error("Error setting coordinator public key:", err);
    }
  }, [coordinatorPubKeyResult]);

  useEffect(() => {
    if (!poll) return;
    const currentStatus = getPollStatus(poll);
    setStatus(currentStatus);
  }, [poll]);

  if (pollError) {
    return (
      <div className={styles["error-state"]}>
        <h3>Error Loading Poll</h3>
        <p>There was a problem loading the poll details. Please try again.</p>
        <Button
          className={styles["retry-btn"]}
          action={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!poll) return null;
  return (
    <div className={styles["poll-details"]}>
      <PollHeader
        pollName={poll.name}
        pollDescription={pollMetadata.description}
        pollEndTime={poll.endTime}
        pollStartTime={poll.startTime}
        authType={authType}
        status={status}
        isConnected={isConnected}
        isUserRegistered={isUserRegistered}
        anonAadhaarStatus={AnonAadhaar.status}
        isRegistering={isRegistering}
        onRegister={registerUser}
      />

      <VotingSection
        votes={votes}
        pollTitle={poll.name}
        pollDescription={pollMetadata.description}
        pollId={id}
        pollStatus={status}
        pollType={pollMetadata.pollType}
        maxVotePerPerson={pollMetadata.maxVotePerPerson}
        authType={authType}
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
