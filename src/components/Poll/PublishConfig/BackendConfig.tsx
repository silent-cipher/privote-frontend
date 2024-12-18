import styles from "~~/styles/publish.module.css";
import WithoutImageInput from "~~/components/admin/CreatePollForm/components/WithoutImageInput";

interface BackendConfigProps {
  isSelected: boolean;
  onClick: () => void;
  privKeyValue: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
  btnText: string;
}

export const BackendConfig = ({
  isSelected,
  onClick,
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
                disabled={!privKeyValue}
                onClick={onPublish}
              >
                {btnText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendConfig;
