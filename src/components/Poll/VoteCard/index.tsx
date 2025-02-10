import Image from "next/image";
import { useState, useCallback } from "react";
import { PollStatus, PollType } from "~~/types/poll";
import { GoLink } from "react-icons/go";
import styles from "./index.module.css";
import { decodeOptionInfo } from "~~/utils/optionInfo";
import CID from "cids";
import { hexToBytes } from "viem";
import { notification } from "~~/utils/scaffold-eth";
import Link from "next/link";
import OptionDetailsModal from "./OptionDetailsModal";

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
  onVote: () => void;
  isLoading: boolean;
  isUserRegistered: boolean;
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
  isUserRegistered,
  isSelected,
  onVoteChange,
  onInvalidStatusChange,
  onSelect,
  maxVotePerPerson,
  onVote,
  isLoading,
}: VoteCardProps) => {
  const [selected, setSelected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cid, description, link } = decodeOptionInfo(bytesCid);

  const handleVoteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isUserRegistered) {
        notification.error("Please register to vote");
        return;
      }
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
      if (!isUserRegistered) {
        notification.error("Please register to vote");
        return;
      }

      if (maxVotePerPerson && currentTotalVotes + votes > maxVotePerPerson) {
        notification.info("You have reached the maximum vote limit");
        return;
      }
      onVoteChange(index, votes);
      onInvalidStatusChange(false);
    },
    [index, onVoteChange, onInvalidStatusChange, maxVotePerPerson]
  );

  const votePercentage =
    totalVotes > 0 && result
      ? Math.round((result.votes / totalVotes) * 100)
      : 0;

  return (
    <>
      <label
        htmlFor={`candidate-votes-${index}`}
        className={`${styles.card} ${votes !== 0 ? styles.selected : ""} ${
          isWinner ? styles.winner : ""
        } ${!description && styles.noDescription}`}
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
          <div className={styles.actions}>
            {link && (
              <Link
                className={styles.link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GoLink fill="#7F58B7" size={20} />{" "}
                <span className={styles["link-text"]}>Link</span>
              </Link>
            )}
            {description && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (pollType === PollType.SINGLE_VOTE) {
                    onVoteChange(index, 1);
                  }
                  setIsModalOpen(true);
                }}
                className={styles.viewMore}
              >
                View More
              </button>
            )}
          </div>
        </div>
        {pollOpen && (
          <div className={styles.voteControls}>
            {pollType !== PollType.WEIGHTED_MULTIPLE_VOTE && (
              <div className={styles["vote-label-container"]}>
                <input
                  type={
                    pollType === PollType.SINGLE_VOTE ? "radio" : "checkbox"
                  }
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
                {description && (
                  <label
                    htmlFor={`candidate-votes-${index}`}
                    className={`${styles["vote-label"]} ${
                      votes !== 0 ? styles.selected : ""
                    }`}
                  >
                    <p>{votes !== 0 ? "Selected" : "Select"}</p>
                  </label>
                )}
              </div>
            )}

            {pollType === PollType.WEIGHTED_MULTIPLE_VOTE && (
              <div className={styles.box}>
                <button
                  type="button"
                  onClick={() => {
                    if (votes > 0) {
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
                  min={0}
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
          <div
            className={`${styles.result} ${!description && styles.vertical}`}
          >
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
      <OptionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        description={description || ""}
        imageUrl={
          cid && cid !== "0x" && cid.length > 2
            ? `${process.env.NEXT_PUBLIC_LH_GATEWAY}/ipfs/${new CID(
                hexToBytes(cid as `0x${string}`)
              ).toString()}`
            : undefined
        }
        link={link}
        pollType={pollType}
        isLoading={isLoading}
        onVote={
          pollType === PollType.SINGLE_VOTE && pollOpen ? onVote : undefined
        }
      />
    </>
  );
};

export default VoteCard;
