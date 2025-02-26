import styles from "./index.module.css";
import Image from "next/image";
import Modal from "../Modal";
import loaderGif from "../../../../public/loader.gif";
import checkIcon from "../../../../public/circle-tick.svg";
import { ProofGenerationStatus } from "~~/services/socket/types/response";

const btnTextMap = {
  [ProofGenerationStatus.IDLE]: "Publish Result",
  [ProofGenerationStatus.ACCEPTED]: "Starting Proof Generation...",
  [ProofGenerationStatus.MERGINGMESSAGES]: "Merging Messages...",
  [ProofGenerationStatus.MERGINGSIGNUPS]: "Merging Signups...",
  [ProofGenerationStatus.GENERATINGPROOF]: "Generating Proof...",
  [ProofGenerationStatus.SUBMITTINGONCHAIN]: "Submitting onchain...",
  [ProofGenerationStatus.SUCCESS]: "Result Published",
  [ProofGenerationStatus.ERROR]: "Publish Result",
  [ProofGenerationStatus.REJECTED]: "Publish Result",
};

const LoaderModal: React.FC<{
  isOpen: boolean;
  status: ProofGenerationStatus;
  onClose?: () => void;
}> = ({ isOpen, status, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      showCloseButton
      maxWidth="300px"
      padding="8px"
      onClose={onClose || (() => {})}
    >
      <div className={styles.container}>
        {status === ProofGenerationStatus.SUCCESS ? (
          <Image src={checkIcon} alt="check" width={200} height={200} />
        ) : (
          <Image src={loaderGif} alt="loader" width={200} height={200} />
        )}
        <div
          className={`${styles["content"]} ${
            status === ProofGenerationStatus.SUCCESS ? styles.published : ""
          }}`}
        >
          <p className={styles.text}>{btnTextMap[status]}</p>
        </div>
      </div>
    </Modal>
  );
};

export default LoaderModal;
