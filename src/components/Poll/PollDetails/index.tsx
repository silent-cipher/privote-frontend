import { useEffect, useState } from "react";
import { useContractRead } from "wagmi";
import { useAccount } from "wagmi";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import { PubKey } from "maci-domainobjs";
import styles from "~~/styles/userPoll.module.css";
import PollAbi from "~~/abi/Poll";
import { PollType, PollStatus } from "~~/types/poll";
import { usePollContext } from "~~/contexts/PollContext";
import { getPollStatus } from "~~/hooks/useFetchPolls";
import useUserRegister from "~~/hooks/useUserRegister";
import useVoting from "~~/hooks/useVoting";
import usePollResults from "~~/hooks/usePollResults";
import PollHeader from "../PollHeader";
import VotingSection from "../VotingSection";
import Button from "~~/components/ui/Button";
import { useSigContext } from "~~/contexts/SigContext";

interface IPollDetails {
  id: bigint;
  isUserRegistered: boolean;
}

const PollDetails = ({ id, isUserRegistered }: IPollDetails) => {
  const [pollType, setPollType] = useState(PollType.NOT_SELECTED);
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
    poll?.authType
  );
  const [status, setStatus] = useState<PollStatus>();
  const [coordinatorPubKey, setCoordinatorPubKey] = useState<PubKey>();
  const {
    result,
    totalVotes,
    isLoading: isResultsLoading,
    error: resultsError,
  } = usePollResults(poll);

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
      setPollType(pollType as PollType);
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

  if (!poll || isPollLoading) {
    return (
      <div className={styles["loading-state"]}>
        <div className="spinner large"></div>
      </div>
    );
  }
  return (
    <div className={styles["poll-details"]}>
      <PollHeader
        pollName={poll.name}
        authType={poll.authType}
        status={status}
        isConnected={isConnected}
        isUserRegistered={isUserRegistered}
        anonAadhaarStatus={AnonAadhaar.status}
        isRegistering={isRegistering}
        onRegister={registerUser}
      />

      <VotingSection
        pollId={id}
        pollStatus={status}
        pollType={pollType}
        authType={poll.authType}
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
