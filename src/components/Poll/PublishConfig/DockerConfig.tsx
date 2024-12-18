import styles from "~~/styles/publish.module.css";
import WithoutImageInput from "~~/components/admin/CreatePollForm/components/WithoutImageInput";

interface DockerConfigProps {
  isSelected: boolean;
  onClick: () => void;
  cidValue: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
}

export const DockerConfig = ({
  isSelected,
  onClick,
  cidValue,
  onFormChange,
  onPublish,
}: DockerConfigProps) => {
  return (
    <div className={styles["config-wrapper"]}>
      <div className={styles["config-option"]} onClick={onClick}>
        <div
          className={`${styles.dot} ${isSelected ? styles.selected : ""}`}
        ></div>
        <div className={styles["gen-container"]}>
          <p className={styles["config-heading"]}>Run Docker image Locally</p>
          {isSelected && (
            <div className={styles["public-input-container"]}>
              <p className={`${styles["bg-card"]} ${styles.text}`}>
                First, clone and run the Docker image locally
              </p>
              <div className={styles.command}>
                git clone https://github.com/example/vote-publisher-docker <br />
                cd vote-publisher-docker <br />
                docker build -t vote-publisher . <br />
                docker run -p 8080:8080 vote-publisher <br />
              </div>
              <p className={`${styles["bg-card"]} ${styles.text}`}>
                Once the Docker container is running, use the form below to publish
                results
              </p>
              <WithoutImageInput
                placeholder="Enter tally file CID..."
                value={cidValue}
                onChange={onFormChange}
                name="cid"
                className={styles["public-input"]}
              />
              <button
                className={styles["publish-btn"]}
                disabled={!cidValue}
                onClick={onPublish}
              >
                Publish Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DockerConfig;
