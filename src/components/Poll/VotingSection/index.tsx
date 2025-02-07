import Image from "next/image";
import Link from "next/link";
import styles from "~~/styles/userPoll.module.css";
import { PollStatus, PollType } from "~~/types/poll";
import VoteCard from "../VoteCard";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import useVotingState from "~~/hooks/useVotingState";
import { useCallback, useState, useEffect, useRef } from "react";

interface VotingSectionProps {
  votes: { index: number; votes: number }[];
  pollId: bigint;
  pollTitle: string;
  pollDescription?: string;
  pollStatus?: PollStatus;
  pollType: PollType;
  authType: string;
  maxVotePerPerson?: number;
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
  votes,
  pollId,
  pollTitle,
  pollDescription,
  maxVotePerPerson,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check initially
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        // Get the line height from computed styles
        const lineHeight = parseInt(window.getComputedStyle(descriptionRef.current).lineHeight);
        const maxHeight = lineHeight * 5; // Height for 5 lines
        
        // Check if content height is greater than max height
        setIsContentOverflowing(descriptionRef.current.scrollHeight > maxHeight);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [pollDescription]);

  const votingState = useVotingState({
    authType,
    pollStatus,
    isConnected,
    isUserRegistered,
    anonAadhaarStatus: AnonAadhaar.status,
    isVotesInvalid: Object.values(isVotesInvalid).some((v) => v),
  });

  const handleVoteChange = useCallback(
    (index: number, votes: number) => {
      const isChecked = votes > 0;
      onVoteUpdate(index, isChecked, votes);
    },
    [onVoteUpdate]
  );

  const handleInvalidStatusChange = useCallback(
    (index: number, status: boolean) => {
      setIsVotesInvalid({ ...isVotesInvalid, [index]: status });
    },
    [isVotesInvalid, setIsVotesInvalid]
  );

  const handleSelect = useCallback(
    (index: number) => {
      if (pollType === PollType.SINGLE_VOTE) {
        setSelectedCandidate(index);
        // Reset invalid status for all options when selecting in single vote mode
        setIsVotesInvalid(
          Object.keys(isVotesInvalid).reduce(
            (acc, key) => ({ ...acc, [key]: false }),
            {}
          )
        );
      } else {
        setSelectedCandidate(index);
        setIsVotesInvalid({ ...isVotesInvalid, [index]: false });
      }
    },
    [pollType, setSelectedCandidate, setIsVotesInvalid, isVotesInvalid]
  );

  return (
    <div className={styles["candidate-container"]}>
      <div className={styles.content}>
        <h1 className={styles.heading}>{pollTitle}</h1>
        {pollDescription && (
          <div>
            <p
              ref={descriptionRef}
              className={`${styles.description} ${
                !isExpanded && isContentOverflowing ? styles.descriptionTruncated : ""
              }`}
            >
              {pollDescription}
              {/* <div className={`${styles.fadeOverlay} ${!isExpanded && isMobile ? styles.fadeOverlayVisible : ''}`} /> */}
            </p>
            {isMobile && isContentOverflowing && (
              <button
                className={styles.showMoreButton}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        )}
      </div>
      {pollStatus === PollStatus.OPEN && (
        <div className={styles.info}>
          <Image src={"/info.svg"} alt="info" width={24} height={24} />
          <p>
            As no one knows whom you voted for, you can change your vote at any
            time before the poll ends
          </p>
        </div>
      )}
      <ul className={styles["candidate-list"]}>
        {options.map((option: string, index: number) => (
          <VoteCard
            key={index}
            votes={votes.find((v) => v.index === index)?.votes || 0}
            pollOpen={pollStatus === PollStatus.OPEN}
            maxVotePerPerson={maxVotePerPerson}
            title={option}
            bytesCid={optionInfo[index]}
            index={index}
            result={result?.find((r) => r.candidate === option)}
            totalVotes={totalVotes}
            isUserRegistered={isUserRegistered}
            currentTotalVotes={votes
              .filter((v) => v.index !== index)
              .reduce((acc, v) => acc + v.votes, 0)}
            isWinner={result?.[0]?.candidate === option}
            pollType={pollType}
            isInvalid={Boolean(isVotesInvalid[index])}
            onVoteChange={(index, votes) => {
              handleVoteChange(index, votes);
            }}
            onInvalidStatusChange={(status) =>
              handleInvalidStatusChange(index, status)
            }
            onSelect={() => handleSelect(index)}
            isSelected={selectedCandidate === index}
            onVote={onVote}
            isLoading={isLoadingBatch || isLoadingSingle}
          />
        ))}
      </ul>
      {votingState.message && pollStatus === PollStatus.OPEN && (
        <p className={styles.message}>{votingState.message}</p>
      )}
      {votingState.canVote && (
        <div className={styles.col}>
          <button
            className={styles["poll-btn"]}
            onClick={onVote}
            disabled={
              isLoadingSingle ||
              isLoadingBatch ||
              Object.values(isVotesInvalid).some((v) => v)
            }
          >
            {isLoadingSingle || isLoadingBatch ? (
              <span className={`${styles.spinner} spinner`}></span>
            ) : (
              <p>Vote Now</p>
            )}
          </button>
        </div>
      )}
      {pollStatus === PollStatus.CLOSED && pollDeployer === userAddress && (
        <Link
          href={`/polls/${pollId}/publish?authType=${authType}&pollType=${pollType}`}
          className={styles["poll-btn"]}
        >
          {isLoadingSingle || isLoadingBatch ? (
            <span className={`${styles.spinner} spinner`}></span>
          ) : (
            <p>Publish Results</p>
          )}
        </Link>
      )}
    </div>
  );
};

export default VotingSection;
