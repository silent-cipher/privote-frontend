"use client";
import React, { useState } from "react";
import Modal from "../Modal";
import Image from "next/image";
import styles from "./index.module.css";
import { IoWarningOutline } from "react-icons/io5";
import { IoCopy, IoCheckmark } from "react-icons/io5";
import { useAccount } from "wagmi";
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FaucetModal: React.FC<FaucetModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGetFaucet = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    // Execute reCAPTCHA v3
    const token = await window.grecaptcha.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "",
      {
        action: "faucet_request",
      }
    );

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/faucet/${address}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ captchaToken: token }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to get test ETH");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get test ETH");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} showCloseButton maxWidth="400px" onClose={onClose}>
      <div className={styles.container}>
        <IoWarningOutline size={64} />
        <h3 className={styles.title}>Insufficient Balance</h3>
        <p className={styles.description}>
          Your wallet balance is too low to perform transactions on Arbitrum
          Sepolia network. Verify that you're human to receive test ETH:
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
        {!isLoading && !success && (
          <button onClick={handleGetFaucet} className={styles.getFaucetButton}>
            Get Test ETH
          </button>
        )}

        {isLoading && (
          <div className={styles.statusMessage}>Processing your request...</div>
        )}

        {success && (
          <div className={styles.successMessage}>
            Success! Test ETH has been sent to your wallet.
          </div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.recaptchaNotice}>
          This site is protected by reCAPTCHA and the Google{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.recaptchaLink}
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.recaptchaLink}
          >
            Terms of Service
          </a>{" "}
          apply.
        </div>
      </div>
    </Modal>
  );
};

export default FaucetModal;
