import styles from "./index.module.css";
import Image from "next/image";
import PollOption from "../PollOption";
import { IoMdClose } from "react-icons/io";
import { CandidateSelectionProps } from "../../types";

const CandidateSelection = ({
  candidateSelection,
  setCandidateSelection,
  handleAddOption,
  handleOptionChange,
  options,
  files,
  onFileChange,
  onFileRemove,
  onRemoveOption,
}: CandidateSelectionProps) => {
  return (
    <div className={styles["candidate-box"]}>
      <div className={styles["candidate-header"]}>
        <h1>Add your candidates</h1>
        {(candidateSelection === "withImage" ||
          candidateSelection === "withoutImage") && (
          <div className={styles["candidate-add"]}>
            <button
              type="button"
              className={styles["change-selection"]}
              onClick={() => {
                setCandidateSelection("none");
              }}
            >
              <IoMdClose size={30} fill="#fff" />
            </button>
            <button
              type="button"
              className={styles["add-candidate-btn"]}
              onClick={handleAddOption}
            >
              <Image
                src={"/plus-circle.svg"}
                width={32}
                height={32}
                alt="plus circle"
              ></Image>
              Add candidate
            </button>
          </div>
        )}
      </div>
      {candidateSelection === "none" ? (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => {
              setCandidateSelection("withoutImage");
            }}
          >
            Add candidates
          </button>
          <button
            type="button"
            onClick={() => setCandidateSelection("withImage")}
          >
            Add candidates with image
          </button>
        </div>
      ) : (
        <>
          {options.map((option, index) => (
            <PollOption
              key={index}
              option={option}
              index={index}
              file={files?.[index] || null}
              onOptionChange={handleOptionChange}
              onFileChange={onFileChange}
              onFileRemove={onFileRemove}
              onRemoveOption={onRemoveOption}
              candidateSelection={candidateSelection}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default CandidateSelection;
