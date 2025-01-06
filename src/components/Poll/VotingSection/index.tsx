import Link from "next/link";
import styles from "~~/styles/userPoll.module.css";
import { PollStatus, PollType } from "~~/types/poll";
import VoteCard from "../VoteCard";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import useVotingState from "~~/hooks/useVotingState";

interface VotingSectionProps {
  pollId: bigint;
  pollStatus?: PollStatus;
  pollType: PollType;
  authType: string;
  options: readonly string[];
  optionInfo: readonly string[];
  pollDeployer: string;
  userAddress?: string;
  isConnected: boolean;
  isUserRegistered: boolean;
  result: { candidate: string; votes: number }[] | null;
  totalVotes: number;
  isVotesInvalid: Record<number, boolean>;
  selectedCandidate: number | null;
  isLoadingSingle: boolean;
  isLoadingBatch: boolean;
  onVoteUpdate: (index: number, checked: boolean, votes: number) => void;
  setIsVotesInvalid: (status: Record<number, boolean>) => void;
  setSelectedCandidate: (index: number | null) => void;
  onVote: () => void;
}

export const VotingSection = ({
  pollId,
  pollStatus,
  pollType,
  authType,
  options,
  optionInfo,
  pollDeployer,
  userAddress,
  isConnected,
  isUserRegistered,
  result,
  totalVotes,
  isVotesInvalid,
  selectedCandidate,
  isLoadingSingle,
  isLoadingBatch,
  onVoteUpdate,
  setIsVotesInvalid,
  setSelectedCandidate,
  onVote,
}: VotingSectionProps) => {
  const [AnonAadhaar] = useAnonAadhaar();
  const votingState = useVotingState({
    authType,
    pollStatus,
    isConnected,
    isUserRegistered,
    anonAadhaarStatus: AnonAadhaar.status,
    isVotesInvalid: Object.values(isVotesInvalid).some((v) => v),
  });

  const handleOptionSelect = (index: number) => {
    setSelectedCandidate(index);
    setIsVotesInvalid({ ...isVotesInvalid, [index]: false });
  };

  return (
    <div className={styles["candidate-container"]}>
      <ul className={styles["candidate-list"]}>
        {options.map((option: string, index: number) => (
          <VoteCard
            key={index}
            pollOpen={pollStatus === PollStatus.OPEN}
            title={option}
            bytesCid={optionInfo[index]}
            index={index}
            pollStatus={pollStatus}
            description={
              option.toLowerCase() === "harris" ? "Democrat" : "Republican"
            }
            image={
              option.toLowerCase() === "harris" ? "/kamala.svg" : "/trump.svg"
            }
            result={result?.find((r) => r.candidate === option)}
            totalVotes={totalVotes}
            isWinner={result?.[0]?.candidate === option}
            clicked={false}
            pollType={pollType}
            onChange={(checked, votes) => onVoteUpdate(index, checked, votes)}
            isInvalid={Boolean(isVotesInvalid[index])}
            setIsInvalid={(status) =>
              setIsVotesInvalid({ ...isVotesInvalid, [index]: status })
            }
            onVote={onVote}
            isSelected={selectedCandidate === index}
            setSelectedCandidate={handleOptionSelect}
          />
        ))}
      </ul>
      <div className={styles.col}>
        {votingState.message && (
          <div className={styles.text}>{votingState.message}</div>
        )}
        {votingState.showVoteButton && isConnected && isUserRegistered && (
          <button
            className={styles["poll-btn"]}
            disabled={
              isLoadingSingle ||
              isLoadingBatch ||
              Object.values(isVotesInvalid).some((v) => v) ||
              !isUserRegistered ||
              !isConnected
            }
            onClick={onVote}
          >
            {isLoadingSingle || isLoadingBatch ? (
              <span className={`${styles.spinner} spinner`}></span>
            ) : (
              <p>Vote Now</p>
            )}
          </button>
        )}
      </div>
      {pollStatus === PollStatus.CLOSED && userAddress === pollDeployer && (
        <Link
          className={styles["poll-btn"]}
          href={`/polls/${pollId}/publish?authType=${authType}`}
        >
          <p>Publish Result</p>
        </Link>
      )}
    </div>
  );
};

export default VotingSection;
