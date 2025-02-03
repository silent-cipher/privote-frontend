import Image from "next/image";
import { PollSettingsProps } from "../types";
import { PollType, EMode } from "~~/types/poll";
import styles from "../index.module.css";

export const PollSettings = ({
  pollData,
  onPollTypeChange,
  onModeChange,
  onMaxVoteChange,
}: PollSettingsProps) => {
  return (
    <>
      <div className={styles["input-field-container"]}>
        <label className={styles.label}>Select Poll Type</label>
        <select
          required
          value={pollData.pollType || ""}
          onChange={onPollTypeChange}
        >
          <option value="">Select Poll Type</option>
          <option value={PollType.SINGLE_VOTE}>Single Candidate Select</option>
          <option value={PollType.MULTIPLE_VOTE}>
            Multiple Candidate Select
          </option>
          <option value={PollType.WEIGHTED_MULTIPLE_VOTE}>
            Weighted-Multiple Candidate Select
          </option>
        </select>
      </div>

      {pollData.pollType === PollType.WEIGHTED_MULTIPLE_VOTE && (
        <div className={styles["input-field-container-row"]}>
          <label className={styles.label}>Max. vote per person</label>
          <div className={styles.box}>
            <button
              type="button"
              onClick={() => {
                if (pollData.maxVotePerPerson > 1) {
                  onMaxVoteChange(1, "remove");
                }
              }}
            >
              <Image src="/minus.svg" alt="minus" width={20} height={20} />
            </button>
            <input
              type="number"
              value={pollData.maxVotePerPerson}
              onChange={onMaxVoteChange}
              min={1}
              max={100}
            />
            <button
              type="button"
              onClick={() => {
                if (pollData.maxVotePerPerson < 100) {
                  onMaxVoteChange(1, "add");
                }
              }}
            >
              <Image src="/plus.svg" alt="plus" width={20} height={20} />
            </button>
          </div>
        </div>
      )}

      <div className={styles["input-field-container"]}>
        <label className={styles.label}>Select Vote Type</label>
        <select
          value={pollData.mode === null ? "" : pollData.mode}
          onChange={onModeChange}
          required
        >
          <option value="">Select Vote Type</option>
          <option value={EMode.QV}>Quadratic Vote</option>
          <option value={EMode.NON_QV}>Non Quadratic Vote</option>
        </select>
      </div>
    </>
  );
};
