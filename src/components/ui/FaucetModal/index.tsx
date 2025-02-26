"use client";
import React, { useState } from "react";
import Modal from "../Modal";
import Image from "next/image";
import styles from "./index.module.css";
import { IoWarningOutline } from "react-icons/io5";
import { IoCopy, IoCheckmark } from "react-icons/io5";
import { useAccount } from "wagmi";

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FaucetModal: React.FC<FaucetModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <Modal isOpen={isOpen} showCloseButton maxWidth="400px" onClose={onClose}>
      <div className={styles.container}>
        <IoWarningOutline size={64} />
        <h3 className={styles.title}>Insufficient Balance</h3>
        <p className={styles.description}>
          Your wallet balance is too low to perform transactions on Arbitrum
          Sepolia network. Copy your address and get some test ETH from the
          following faucets:
        </p>
        {address && (
          <div className={styles.addressContainer} onClick={handleCopy}>
            <div className={styles.address}>
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </div>
            <button className={styles.copyButton}>
              {copied ? <IoCheckmark size={20} /> : <IoCopy size={20} />}
            </button>
          </div>
        )}
        <div className={styles.links}>
          <a
            href="https://www.alchemy.com/faucets/arbitrum-sepolia"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Alchemy Faucet
          </a>
          <a
            href="https://faucet.quicknode.com/arbitrum/sepolia"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            QuickNode Faucet
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default FaucetModal;
