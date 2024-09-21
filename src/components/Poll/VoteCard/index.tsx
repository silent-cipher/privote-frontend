import Image from "next/image";
import { PollStatus, PollType } from "~~/types/poll";
import styles from "./index.module.css";
import { useState, useRef } from "react";

interface VoteCardProps {
  title: string;
  description: string;
  image: string;
  pollStatus: PollStatus | undefined;
  onVote: () => void;
  result: { candidate: string; votes: number } | undefined;
  totalVotes: number;
  isWinner: boolean;
  index: number;
  pollOpen: boolean;
  clicked: boolean;
  pollType: PollType;
  isInvalid: boolean;
  setIsInvalid: (status: boolean) => void;
  onChange: (checked: boolean, votes: number) => void;
  isSelected: boolean;
  setSelectedCandidate: (index: number) => void;
}

const VoteCard = ({
  title,
  description,
  image,
  pollStatus,
  onVote,
  result,
  totalVotes,
  isWinner,
  onChange,
  setIsInvalid,
  pollType,
  isInvalid,
  pollOpen,
  index,
  setSelectedCandidate,
  isSelected,
}: VoteCardProps) => {
  const [selected, setSelected] = useState(false);
  const [votes, setVotes] = useState(0);
  const votesFieldRef = useRef<HTMLInputElement>(null);
  return (
    <label
      htmlFor={`candidate-votes-${index}`}
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      onClick={() => {
        setSelectedCandidate(index);
      }}
    >
      {pollOpen && (
        <input
          id={`candidate-votes-${index}`}
          type={pollType === PollType.SINGLE_VOTE ? "radio" : "checkbox"}
          value={index}
          style={{ display: "none" }}
          onChange={(e) => {
            console.log(e.target.checked);
            setSelected(e.target.checked);
            if (e.target.checked) {
              switch (pollType) {
                case PollType.SINGLE_VOTE:
                  onChange(true, 1);
                  break;
                case PollType.MULTIPLE_VOTE:
                  onChange(true, 1);
                  break;
                case PollType.WEIGHTED_MULTIPLE_VOTE:
                  if (votes) {
                    onChange(true, votes);
                  } else {
                    setIsInvalid(true);
                  }
                  break;
              }
            } else {
              onChange(false, 0);
              setIsInvalid(false);
              setVotes(0);
              if (votesFieldRef.current) {
                votesFieldRef.current.value = "";
              }
            }
          }}
          name={
            pollType === PollType.SINGLE_VOTE
              ? "candidate-votes"
              : `candidate-votes-${index}`
          }
        />
      )}
      <div className={styles.image}>
        <img src={image} alt={title} />
      </div>
      <div className={styles.content}>
        <div className={styles.details}>
          <Image
            src={
              title.toLowerCase() == "kamala harris"
                ? "/democrat-icon.svg"
                : "/republican-icon.svg"
            }
            width={36}
            height={36}
            alt="icon"
          />
          <div className={styles.content}>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        </div>
        {/* {pollStatus == PollStatus.OPEN && (
          <button
            className={`${styles.button} ${
              pollStatus === PollStatus.OPEN
                ? styles.live
                : pollStatus === PollStatus.NOT_STARTED
                ? styles.notStarted
                : styles.startingSoon
            }`}
            disabled={pollStatus !== PollStatus.OPEN}
            onClick={() => {
              onChange(true, 1);
              setTimeout(() => {
                onVote();
              }, 5000);
            }}
          >
            {pollStatus === PollStatus.OPEN
              ? "Vote now"
              : pollStatus === PollStatus.NOT_STARTED
              ? "Not Started"
              : "Starting Soon"}
          </button>
        )} */}
        {result && pollStatus === PollStatus.RESULT_COMPUTED && (
          <div className={styles.result}>
            <p className={styles["vote-number"]}>{result.votes} votes</p>
            <p className={`${isWinner ? styles.winner : styles["not-winner"]}`}>
              {Math.floor(result.votes / totalVotes) * 100}%
            </p>
          </div>
        )}
      </div>
    </label>
  );
};

export default VoteCard;
