"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./index.module.css";
import { EMode } from "~~/types/poll";

interface WeightInputProps {
  index: number;
  votes: string;
  maxVotePerPerson: number | undefined;
  handleWeightedVoteChange: (
    prevVotes: string | undefined,
    votes: string,
    index: number
  ) => void;
  isInvalid: boolean;
  isQv: EMode;
}

const WeightInput = ({
  index,
  votes,
  maxVotePerPerson,
  handleWeightedVoteChange,
  isInvalid,
  isQv,
}: WeightInputProps) => {
  const [showInitial, setShowInitial] = useState(true);

  useEffect(() => {
    if (votes.length > 0) setShowInitial(false);
  }, [votes]);

  return (
    <div className={styles["mw"]}>
      <div className={styles.box}>
        <button
          type="button"
          onClick={() => {
            if (Number(votes) > 0) {
              // setShowInitial(false);
              const newValue = Number(votes) - 1;
              handleWeightedVoteChange(votes, newValue.toString(), index);
            }
          }}
        >
          <Image src="/minus.svg" alt="minus" width={16} height={16} />
        </button>
        <input
          type="text"
          onChange={(e) => {
            setShowInitial(false);
            const value = e.target.value;
            // Only allow numeric input (empty or numbers)
            if (value === "" || /^\d+$/.test(value)) {
              handleWeightedVoteChange(votes, value, index);
            }
          }}
          min={0}
          max={maxVotePerPerson}
          value={showInitial ? "0" : votes}
          className={`${styles.weightInput} ${isInvalid ? styles.invalid : ""}`}
        />
        <button
          type="button"
          onClick={() => {
            const newValue = Number(votes) + 1;
            if (!maxVotePerPerson || Number(newValue) <= maxVotePerPerson) {
              // setShowInitial(false);
              handleWeightedVoteChange(votes, newValue.toString(), index);
            }
          }}
        >
          <Image src="/plus.svg" alt="plus" width={16} height={16} />
        </button>
      </div>
      {isQv === EMode.QV && (
        <div className={styles["vote-weight"]}>
          <p>Weight: {Math.floor(Math.sqrt(Number(votes)))}</p>
        </div>
      )}
    </div>
  );
};

export default WeightInput;
