import { PollOptionProps } from "../../types";
import WithImageInput from "../WithImageInput";
import WithoutImageInput from "../WithoutImageInput";
import styles from "./index.module.css";
import { IoMdClose } from "react-icons/io";

const PollOption = ({
  option,
  index,
  file,
  onOptionChange,
  onFileChange,
  onFileRemove,
  onRemoveOption,
  candidateSelection,
}: PollOptionProps) => {
  return (
    <div className={styles["candidate-input"]}>
      <div className={styles["option-fields"]}>
        {candidateSelection === "withoutImage" && (
          <>
            <WithoutImageInput
              type="text"
              placeholder={`Candidate ${index + 1} Title`}
              value={option.title || ""}
              onChange={(e) => onOptionChange(index, e.target.value, "title")}
            />
            {/* <WithoutImageInput
              type="text"
              placeholder={`Option ${index + 1} Description`}
              value={option.description || ""}
              onChange={(e) =>
                onOptionChange(index, e.target.value, "description")
              }
            /> */}
            <textarea
              placeholder={`Candidate ${index + 1} Description`}
              value={option.description || ""}
              onChange={(e) =>
                onOptionChange(index, e.target.value, "description")
              }
            />
          </>
        )}
        {candidateSelection === "withImage" && (
          <div className={styles["image-option"]}>
            <WithImageInput
              index={index}
              type="text"
              placeholder={`Candidate ${index + 1} Title`}
              option={option}
              file={file}
              onChange={(e, field) =>
                onOptionChange(index, e.target.value, field)
              }
              onFileRemove={() => onFileRemove(index)}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileChange(index, file);
              }}
            />
          </div>
        )}
      </div>
      {index > 0 && (
        <button
          type="button"
          onClick={() => onRemoveOption(index)}
          className={styles["remove-option-btn"]}
        >
          <IoMdClose size={20} />
        </button>
      )}
    </div>
  );
};

export default PollOption;
