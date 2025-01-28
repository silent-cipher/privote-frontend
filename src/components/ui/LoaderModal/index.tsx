import styles from "./index.module.css";
import Image from "next/image";
import Modal from "../Modal";
import loaderGif from "../../../../public/loader.gif";
import checkIcon from "../../../../public/circle-tick.svg";
import { ProofGenerationStatus } from "~~/services/socket/types/response";

const btnTextMap = {
  [ProofGenerationStatus.IDLE]: "Publish Results",
  [ProofGenerationStatus.ACCEPTED]: "Starting Proof Generation...",
  [ProofGenerationStatus.MERGINGMESSAGES]: "Merging Messages...",
  [ProofGenerationStatus.MERGINGSIGNUPS]: "Merging Signups...",
  [ProofGenerationStatus.GENERATINGPROOF]: "Generating Proof...",
  [ProofGenerationStatus.UPLOADINGTOIPFS]: "Uploading to IPFS...",
  [ProofGenerationStatus.SUCCESS]: "Awaiting for confirmation...",
  [ProofGenerationStatus.PUBLISHED]: "Results Published",
  [ProofGenerationStatus.ERROR]: "Error",
  [ProofGenerationStatus.REJECTED]: "Rejected",
};

const LoaderModal: React.FC<{
  isOpen: boolean;
  status: ProofGenerationStatus;
}> = ({ isOpen, status }) => {
  return (
    <Modal
      isOpen={isOpen}
      showCloseButton={false}
      maxWidth="300px"
      onClose={() => {}}
    >
      <div className={styles.container}>
        {status === ProofGenerationStatus.PUBLISHED ? (
          <Image src={checkIcon} alt="check" width={200} height={200} />
        ) : (
          <Image src={loaderGif} alt="loader" width={200} height={200} />
        )}
        <div
          className={`${styles["content"]} ${
            status === ProofGenerationStatus.PUBLISHED ? styles.published : ""
          }}`}
        >
          <p className={styles.text}>{btnTextMap[status]}</p>
        </div>
      </div>
    </Modal>
  );
};

export default LoaderModal;
