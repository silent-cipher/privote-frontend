import styles from "~~/styles/publish.module.css";
import WithoutImageInput from "~~/components/admin/CreatePollForm/components/WithoutImageInput";
import { ProofGenerationStatus } from "~~/services/socket/types/response";

interface BackendConfigProps {
  isSelected: boolean;
  proofGenerationState: ProofGenerationStatus;
  onClick: () => void;
  privKeyValue: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
  btnText: string;
}

const btnTextMap = {
  [ProofGenerationStatus.IDLE]: "Publish Result",
  [ProofGenerationStatus.ACCEPTED]: "Starting Proof Generation...",
  [ProofGenerationStatus.MERGINGMESSAGES]: "Merging Messages...",
  [ProofGenerationStatus.MERGINGSIGNUPS]: "Merging Signups...",
  [ProofGenerationStatus.GENERATINGPROOF]: "Generating Proof...",
  [ProofGenerationStatus.UPLOADINGTOIPFS]: "Uploading to IPFS...",
  [ProofGenerationStatus.SUCCESS]: "Publishing...",
  [ProofGenerationStatus.PUBLISHED]: "Results Published",
  [ProofGenerationStatus.ERROR]: "Publish Result",
  [ProofGenerationStatus.REJECTED]: "Publish Result",
};

export const BackendConfig = ({
  isSelected,
  onClick,
  proofGenerationState,
  privKeyValue,
  onFormChange,
  onPublish,
  btnText,
}: BackendConfigProps) => {
  return (
    <div className={styles["config-wrapper"]}>
      <div className={styles["config-option"]} onClick={onClick}>
        <div
          className={`${styles.dot} ${isSelected ? styles.selected : ""}`}
        ></div>
        <div className={styles["gen-container"]}>
          <p className={styles["config-heading"]}>
            Use Privote's Backend Services (trust us we're good 🙂)
          </p>
          {isSelected && (
            <div className={styles["public-input-container"]}>
              <p className={`${styles["bg-card"]} ${styles.text}`}>
                Use Privote's backend services to publish results
              </p>
              <WithoutImageInput
                placeholder="Enter Coordinator private key..."
                value={privKeyValue}
                onChange={onFormChange}
                name="privKey"
                className={styles["public-input"]}
              />
              <button
                className={styles["publish-btn"]}
                disabled={
                  !privKeyValue ||
                  (proofGenerationState !== ProofGenerationStatus.IDLE &&
                    proofGenerationState !== ProofGenerationStatus.REJECTED &&
                    proofGenerationState !== ProofGenerationStatus.ERROR)
                }
                onClick={onPublish}
              >
                {btnTextMap[proofGenerationState]}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendConfig;
