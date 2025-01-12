import Image from "next/image";
import { PollStatus, PollType } from "~~/types/poll";
import styles from "./index.module.css";
import { useState, useRef } from "react";
import CID from "cids";
import { hexToBytes } from "viem";

interface VoteCardProps {
  title: string;
  bytesCid: string;
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
  bytesCid,
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

  console.log(Number(pollType) === PollType.SINGLE_VOTE);
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
          type={
            Number(pollType) === PollType.SINGLE_VOTE ? "radio" : "checkbox"
          }
          style={{ display: "none" }}
          onChange={(e) => {
            setSelected(e.target.checked);
            if (e.target.checked) {
              switch (Number(pollType)) {
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
      {bytesCid && bytesCid !== "0x" && bytesCid.length > 2 && (
        <div className={styles.image}>
          <Image
            src={`${process.env.NEXT_PUBLIC_LH_GATEWAY}/ipfs/${new CID(
              hexToBytes(bytesCid as `0x${string}`)
            ).toString()}`}
            loading="lazy"
            loader={(p) => {
              return `${p.src}?img-width=${p.width}&img-height=${p.width}`;
            }}
            height={400}
            width={400}
            alt="candidate"
          />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.details}>
          {(title === "Trump" || title === "Harris") && (
            <Image
              src={
                title.toLowerCase() == "harris"
                  ? "/democrat-icon.svg"
                  : "/republican-icon.svg"
              }
              width={36}
              height={36}
              alt="icon"
            />
          )}
          <div className={styles.content}>
            <h3>{title}</h3>
            {(title === "Trump" || title === "Harris") && <p>{description}</p>}
          </div>
        </div>

        {pollOpen && pollType === PollType.WEIGHTED_MULTIPLE_VOTE && (
          <input
            ref={votesFieldRef}
            type="number"
            className={styles.input + " " + (isInvalid ? styles.invalid : "")}
            disabled={!selected}
            placeholder="Votes"
            min={0}
            step={1}
            onChange={function (e) {
              if (
                Number(e.currentTarget.value) < 0 ||
                (selected &&
                  (e.currentTarget.value === "" ||
                    Number(e.currentTarget.value) == 0))
              ) {
                setIsInvalid(true);
              } else {
                setIsInvalid(false);
                setVotes(Number(e.currentTarget.value));
                onChange(selected, Number(e.currentTarget.value));
              }
            }}
          />
        )}
        {result && pollStatus === PollStatus.RESULT_COMPUTED && (
          <div className={styles.result}>
            <p className={styles["vote-number"]}>{result.votes} votes</p>
            <p className={`${isWinner ? styles.winner : styles["not-winner"]}`}>
              {Math.ceil((result.votes / totalVotes) * 100) || 0}%
            </p>
          </div>
        )}
      </div>
    </label>
  );
};

export default VoteCard;
