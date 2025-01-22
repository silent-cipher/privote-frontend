import Image from "next/image";
import { useState, useCallback } from "react";
import { PollStatus, PollType } from "~~/types/poll";
import styles from "./index.module.css";
import { decodeOptionInfo } from "~~/utils/optionInfo";
import CID from "cids";
import { hexToBytes } from "viem";

interface VoteCardProps {
  votes: number;
  title: string;
  bytesCid: string;
  result?: {
    candidate: string;
    votes: number;
  };
  totalVotes: number;
  currentTotalVotes: number;
  isWinner: boolean;
  index: number;
  pollOpen: boolean;
  pollType: PollType;
  isInvalid: boolean;
  isSelected: boolean;
  onVoteChange: (index: number, votes: number) => void;
  onInvalidStatusChange: (status: boolean) => void;
  onSelect: (index: number) => void;
  maxVotePerPerson?: number;
}

const VoteCard = ({
  votes,
  title,
  bytesCid,
  result,
  totalVotes,
  currentTotalVotes,
  isWinner,
  pollType,
  isInvalid,
  pollOpen,
  index,
  isSelected,
  onVoteChange,
  onInvalidStatusChange,
  onSelect,
  maxVotePerPerson,
}: VoteCardProps) => {
  const [selected, setSelected] = useState(false);
  const { cid, description } = decodeOptionInfo(bytesCid);

  const handleVoteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelected(e.target.checked);
      const isChecked = e.target.checked;

      if (isChecked) {
        switch (Number(pollType)) {
          case PollType.SINGLE_VOTE:
          case PollType.MULTIPLE_VOTE:
            onVoteChange(index, 1);
            break;
          case PollType.WEIGHTED_MULTIPLE_VOTE:
            // For weighted votes, we'll handle the vote count in a separate input
            onInvalidStatusChange(true);
            break;
        }
      } else {
        onVoteChange(index, 0);
        onInvalidStatusChange(false);
      }
    },
    [index, pollType, onVoteChange, onInvalidStatusChange]
  );

  const handleWeightedVoteChange = useCallback(
    (votes: number) => {
      if (!isNaN(votes) && votes > 0) {
        // Check if votes exceed maxVotePerPerson (if defined)

        if (maxVotePerPerson && currentTotalVotes + votes > maxVotePerPerson) {
          onInvalidStatusChange(true);
          return;
        }
        onVoteChange(index, votes);
        onInvalidStatusChange(false);
      } else {
        onInvalidStatusChange(true);
      }
    },
    [index, onVoteChange, onInvalidStatusChange, maxVotePerPerson]
  );

  const votePercentage =
    totalVotes > 0 && result
      ? Math.round((result.votes / totalVotes) * 100)
      : 0;

  return (
    <label
      htmlFor={`candidate-votes-${index}`}
      className={`${styles.card} ${votes !== 0 ? styles.selected : ""} ${
        isWinner ? styles.winner : ""
      }`}
    >
      {cid && cid !== "0x" && cid.length > 2 && (
        <div className={styles.image}>
          <img
            src={`${process.env.NEXT_PUBLIC_LH_GATEWAY}/ipfs/${new CID(
              hexToBytes(cid as `0x${string}`)
            ).toString()}`}
            alt={title}
            width={400}
            height={400}
          />
        </div>
      )}

      <div className={styles.content}>
        <h3 className={votes !== 0 ? styles.selected : ""}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {pollOpen && (
        <div className={styles.voteControls}>
          {pollType !== PollType.WEIGHTED_MULTIPLE_VOTE && (
            <div className={styles["vote-label-container"]}>
              <input
                type={pollType === PollType.SINGLE_VOTE ? "radio" : "checkbox"}
                id={`candidate-votes-${index}`}
                name={
                  pollType === PollType.SINGLE_VOTE
                    ? "candidate-votes"
                    : `candidate-votes-${index}`
                }
                style={{ display: "none" }}
                checked={votes !== 0}
                onChange={handleVoteChange}
              />
              <label
                htmlFor={`candidate-votes-${index}`}
                className={styles["vote-label"]}
              >
                <p>Select</p>
              </label>
            </div>
          )}

          {pollType === PollType.WEIGHTED_MULTIPLE_VOTE && (
            <div className={styles.box}>
              <button
                type="button"
                onClick={() => {
                  if (votes > 1) {
                    console.log("votes", votes);
                    handleWeightedVoteChange(votes - 1);
                  }
                }}
              >
                <Image src="/minus.svg" alt="minus" width={16} height={16} />
              </button>
              <input
                type="number"
                onChange={(e) => {
                  handleWeightedVoteChange(parseInt(e.target.value, 10));
                }}
                min={1}
                max={maxVotePerPerson}
                value={votes}
                className={`${styles.weightInput} ${
                  isInvalid ? styles.invalid : ""
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  if (!maxVotePerPerson) {
                    handleWeightedVoteChange(votes + 1);
                  } else {
                    if (votes < maxVotePerPerson) {
                      handleWeightedVoteChange(votes + 1);
                    }
                  }
                }}
              >
                <Image src="/plus.svg" alt="plus" width={16} height={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {result && !pollOpen && (
        <div className={styles.result}>
          <div className={styles.voteBar}>
            <div
              className={styles.voteProgress}
              style={{ width: `${votePercentage}%` }}
            />
          </div>
          <span className={styles.voteCount}>
            {result.votes} votes ({votePercentage}%)
          </span>
        </div>
      )}
    </label>
  );
};

export default VoteCard;
