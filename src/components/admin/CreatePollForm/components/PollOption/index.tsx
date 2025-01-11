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
      {candidateSelection === "withoutImage" && (
        <WithoutImageInput
          type="text"
          placeholder={`Candidate ${index + 1}`}
          value={option.value}
          onChange={(e) => onOptionChange(index, e.target.value)}
        />
      )}
      {candidateSelection === "withImage" && (
        <WithImageInput
          type="text"
          placeholder={`Candidate ${index + 1}`}
          value={option.value}
          file={file}
          onChange={(e) => onOptionChange(index, e.target.value)}
          onFileRemove={() => onFileRemove(index)}
          onFileChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileChange(index, file);
          }}
        />
      )}
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
