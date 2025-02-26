import Image from "next/image";
import Link from "next/link";
import styles from "~~/styles/userPoll.module.css";
import { PollStatus, PollType } from "~~/types/poll";
import VoteCard from "../VoteCard";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import MarkdownRenderer from "~~/components/common/MarkdownRenderer";
import useVotingState from "~~/hooks/useVotingState";
import { useCallback, useState, useEffect, useRef } from "react";
import VoteSummarySection from "../VoteSummarySection";
import { notification } from "~~/utils/scaffold-eth";

interface VotingSectionProps {
  votes: { index: number; votes: string }[];
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
  onVoteUpdate: (index: number, checked: boolean, votes: string) => void;
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
        const lineHeight = parseInt(
          window.getComputedStyle(descriptionRef.current).lineHeight
        );
        const maxHeight = lineHeight * 4; // Height for 4 lines

        // Check if content height is greater than max height
        setIsContentOverflowing(
          descriptionRef.current.scrollHeight > maxHeight
        );
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
    (index: number, votes: string) => {
      onVoteUpdate(index, true, votes);
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

  const currentTotalVotes = votes
    ? votes.reduce((acc, v) => acc + Number(v.votes), 0)
    : 0;

  const handleWeightedVoteChange = useCallback(
    (prevVotes: string | undefined, votes: string, index: number) => {
      // if (!isConnected) {
      //   notification.error("Please connect your wallet");
      //   return;
      // }

      // if (!isUserRegistered) {
      //   notification.error("Please register to vote");
      //   return;
      // }

      if (Number(votes) < 0) return;
      if (
        maxVotePerPerson &&
        currentTotalVotes - (Number(prevVotes) ?? 0) + Number(votes) >
          maxVotePerPerson
      ) {
        notification.info("You have reached the maximum vote limit");
        return;
      }
      handleVoteChange(index, votes);
    },
    [maxVotePerPerson, handleVoteChange, isConnected, isUserRegistered]
  );

  return (
    <div className={styles["candidate-container"]}>
      <div className={styles.content}>
        <h1 className={styles.heading}>{pollTitle}</h1>
        {pollDescription && (
          <div>
            <div
              ref={descriptionRef}
              className={`description ${
                !isExpanded && isContentOverflowing && isMobile
                  ? styles.descriptionTruncated
                  : ""
              }`}
            >
              <MarkdownRenderer
                content={
                  isMobile
                    ? isExpanded
                      ? pollDescription
                      : pollDescription.substring(0, 220)
                    : pollDescription
                }
              />
              {isMobile && (
                <span
                  className={styles.showMoreButton}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {" "}
                  {isExpanded ? "Show less" : "...read more"}
                </span>
              )}
            </div>
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
      <h2 className={styles.heading}>Poll Options</h2>
      <VoteSummarySection
        options={options}
        optionInfo={optionInfo}
        votes={votes}
        maxVotePerPerson={maxVotePerPerson}
        currentTotalVotes={votes.reduce((acc, v) => acc + Number(v.votes), 0)}
        onVoteChange={handleVoteChange}
        onVote={onVote}
        isLoading={isLoadingBatch || isLoadingSingle}
        handleWeightedVoteChange={handleWeightedVoteChange}
        canVote={votingState.canVote}
      >
        <ul className={styles["candidate-list"]}>
          {options.map((option: string, index: number) => (
            <VoteCard
              key={index}
              votes={votes.find((v) => v.index === index)?.votes || ""}
              pollOpen={pollStatus === PollStatus.OPEN}
              maxVotePerPerson={maxVotePerPerson}
              title={option}
              bytesCid={optionInfo[index]}
              index={index}
              result={result?.find((r) => r.candidate === option)}
              totalVotes={totalVotes}
              isUserRegistered={isUserRegistered}
              handleWeightedVoteChange={handleWeightedVoteChange}
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
      </VoteSummarySection>
      {votingState.message && pollStatus === PollStatus.OPEN && (
        <p className={styles.message}>{votingState.message}</p>
      )}
      {votingState.canVote && (
        <div className={styles.col}>
          {pollType !== PollType.WEIGHTED_MULTIPLE_VOTE && (
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
          )}
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
