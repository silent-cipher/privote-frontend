import React from "react";
import { IoMdClose } from "react-icons/io";
import styles from "./InstructionsModal.module.css";
import Link from "next/link";
import Modal from "./Modal";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    // <div className={styles.modalOverlay}>
    //   <div className={styles.modalContent}>
    //     <div className={styles.header}>
    //       <h2>How to Vote</h2>
    //       <button onClick={onClose} className={styles.closeButton}>
    //         <IoMdClose size={24} fill="#434343" />
    //       </button>
    //     </div>
    <Modal
      title="How to Vote"
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      maxWidth="600px"
    >
      <div className={styles.divider} />
      <div className={styles.instructions}>
        <ol>
          <li>Connect your wallet.</li>
          <li>
            Get funds for gas on the Arbitrum Sepolia testnet if needed (use a
            faucet like{" "}
            <Link href="https://faucet.quicknode.com/arbitrum/sepolia">
              this
            </Link>
            ).
          </li>
          <li>
            Login to the mAadhaar app with your Aadhaar credentials and generate
            a QR code. Save it.
          </li>
          <li>
            Click on the Aadhaar login button on the Privote's poll page and
            upload your QR code.
          </li>
          <li>
            Wait for proofs to be generated (this may take a few minutes).
          </li>
          <li>Register with your Aadhaar proof using your wallet.</li>
          <li>
            Distribute your votes to the projects you like (remember, it's
            quadratic voting, so spreading votes wisely is key!).
          </li>
          <li>Click "Vote" to submit your votes.</li>
          <li>
            You're done! 🎉 You can change your votes anytime before the poll
            ends.
          </li>
        </ol>
        <div className={styles.note}>
          <p>
            📢 Share this with others to get more votes for your favorite
            projects! Anyone with a valid Aadhaar can vote.
          </p>
          <p>Happy Voting! 🗳️🚀</p>
        </div>
      </div>
      {/* </div>
    </div> */}
    </Modal>
  );
};

export default InstructionsModal;
