import { useState, useMemo, useRef, useEffect } from "react";
import styles from "./index.module.css";
import { WeightInput } from "../VoteCard/components";
import { PollType } from "~~/types/poll";

interface VoteSummarySectionProps {
  options: readonly string[];
  optionInfo: readonly string[];
  votes: { index: number; votes: string }[];
  maxVotePerPerson?: number;
  currentTotalVotes: number;
  onVoteChange: (index: number, votes: string) => void;
  handleWeightedVoteChange: (
    prevVotes: string | undefined,
    votes: string,
    index: number
  ) => void;
  onVote: () => void;
  isLoading: boolean;
  canVote: boolean;
  children: React.ReactNode;
  pollType: PollType;
}

let showSummary = false;

const VoteSummarySection = ({
  options,
  optionInfo,
  votes,
  maxVotePerPerson = 0,
  currentTotalVotes,
  onVoteChange,
  handleWeightedVoteChange,
  onVote,
  isLoading,
  canVote,
  children,
  pollType,
}: VoteSummarySectionProps) => {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToOption = (index: number) => {
    optionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };
  const totalVotesCast = useMemo(
    () => votes.reduce((acc, vote) => acc + Number(vote.votes), 0),
    [votes]
  );

  const votesLeft = maxVotePerPerson - totalVotesCast;

  useEffect(() => {
    showSummary = false;
  }, []);

  showSummary = !showSummary ? currentTotalVotes > 0 : showSummary;

  return (
    <div className={`${styles.container} ${showSummary ? styles.show : ""}`}>
      {showSummary && pollType === PollType.WEIGHTED_MULTIPLE_VOTE && (
        <div className={styles["left-wrapper"]}>
          <div className={styles.leftColumn}>
            <div className={styles.header}>
              <h2>Voting Summary</h2>
              <p className={styles.votesLeft}>
                You are left with: {votesLeft} votes
              </p>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.optionsList}>
              {options.map((option, index) => {
                const optionVotes = votes.find((v) => v.index === index)?.votes;
                if (!optionVotes || Number(optionVotes) <= 0) return;
                return (
                  <div
                    key={`title_${index}`}
                    className={`${styles.optionRow} ${
                      Number(optionVotes) && Number(optionVotes) > 0
                        ? styles.voted
                        : ""
                    }`}
                    onClick={() => {
                      if (selectedOption !== index) {
                        setSelectedOption(index);
                        scrollToOption(index);
                      }
                    }}
                  >
                    <div className={styles.optionInfo}>
                      <h3>{option}</h3>
                      <WeightInput
                        index={index}
                        votes={optionVotes}
                        maxVotePerPerson={maxVotePerPerson}
                        handleWeightedVoteChange={handleWeightedVoteChange}
                        isInvalid={false}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.bottom}>
              <div className={styles.divider}></div>
              <button
                className={styles.voteButton}
                onClick={onVote}
                disabled={!canVote || isLoading}
              >
                {isLoading ? (
                  <span className={`${styles.spinner} spinner`}></span>
                ) : (
                  <p>Vote Now</p>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.rightColumn}>{children}</div>
    </div>
  );
};

export default VoteSummarySection;
