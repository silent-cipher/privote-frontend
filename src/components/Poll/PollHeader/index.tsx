import Link from "next/link";
import Image from "next/image";
import { LogInWithAnonAadhaar } from "@anon-aadhaar/react";
import styles from "~~/styles/userPoll.module.css";
import Button from "~~/components/ui/Button";
import { AuthType, PollStatus, PollType } from "~~/types/poll";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { FaShare, FaQuestionCircle } from "react-icons/fa";
import ShareModal from "~~/components/ui/ShareModal";
import InstructionsModal from "~~/components/ui/InstructionsModal";

interface PollHeaderProps {
  authType: string;
  pollName: string;
  pollType: PollType;
  pollDescription?: string;
  pollEndTime: bigint;
  pollStartTime: bigint;
  status?: PollStatus;
  isConnected: boolean;
  isUserRegistered: boolean;
  anonAadhaarStatus: string;
  onRegister: () => void;
  isRegistering: boolean;
}

function formatTimeRemaining(time: number) {
  if (time <= 0) return "00:00:00";

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  return time > 86400
    ? `${Math.floor(time / 86400)} days`
    : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
}

export const PollHeader = ({
  authType,
  pollName,
  pollType,
  status,
  isConnected,
  isUserRegistered,
  anonAadhaarStatus,
  onRegister,
  isRegistering,
  pollDescription,
  pollEndTime,
  pollStartTime,
}: PollHeaderProps) => {
  const { address } = useAccount();
  const [timeRemaining, setTimeRemaining] = useState<number>(
    status === PollStatus.OPEN
      ? Number(pollEndTime) - Date.now() / 1000
      : status === PollStatus.NOT_STARTED
      ? Number(pollStartTime) - Date.now() / 1000
      : 0
  );

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleOpenInstructionsModal = () => {
    setIsInstructionsModalOpen(true);
  };

  const handleCloseInstructionsModal = () => {
    setIsInstructionsModalOpen(false);
  };

  useEffect(() => {
    if (status !== PollStatus.CLOSED && status !== PollStatus.RESULT_COMPUTED) {
      const timer = setInterval(() => {
        const newTime =
          status === PollStatus.OPEN
            ? Number(pollEndTime) - Date.now() / 1000
            : Number(pollStartTime) - Date.now() / 1000;
        setTimeRemaining(newTime);

        if (newTime <= 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, pollEndTime, pollStartTime]);

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <Link href={"/polls"} className={styles.back}>
          <Image
            src="/arrow-left.svg"
            alt="arrow left"
            width={27}
            height={27}
          />
        </Link>
        <div className={styles.end}>
          <div className={styles.headerButtons}>
            {pollType === PollType.WEIGHTED_MULTIPLE_VOTE &&
              authType === AuthType.ANON && (
                <button
                  className={styles.instructionsButton}
                  onClick={handleOpenInstructionsModal}
                >
                  <FaQuestionCircle /> How to Vote
                </button>
              )}
            <button
              className={styles.shareButton}
              onClick={handleOpenShareModal}
            >
              <FaShare /> Share
            </button>
          </div>
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={handleCloseShareModal}
            url={typeof window !== "undefined" ? window.location.href : ""}
            title={pollName}
            description={pollDescription}
          />
          <InstructionsModal
            isOpen={isInstructionsModalOpen}
            onClose={handleCloseInstructionsModal}
          />
          {/* {!isConnected && <ConnectButton />} */}
          {isConnected &&
            !isUserRegistered &&
            authType === "anon" &&
            status === PollStatus.OPEN && (
              <LogInWithAnonAadhaar nullifierSeed={4534} signal={address} />
            )}

          {authType === "anon" &&
            status === PollStatus.OPEN &&
            !isUserRegistered &&
            anonAadhaarStatus === "logged-in" &&
            isConnected && (
              <Button action={onRegister} disabled={isRegistering}>
                {isRegistering ? (
                  <span className={`${styles.spinner} spinner`}></span>
                ) : (
                  "Register"
                )}
              </Button>
            )}
          {authType === "free" &&
            status === PollStatus.OPEN &&
            !isUserRegistered &&
            isConnected && (
              <Button action={onRegister} disabled={isRegistering}>
                {isRegistering ? (
                  <span className={`${styles.spinner} spinner`}></span>
                ) : (
                  "Register"
                )}
              </Button>
            )}

          <div className={styles.status}>
            <Image src="/clock.svg" alt="clock" width={24} height={24} />
            {(status === PollStatus.CLOSED ||
              status === PollStatus.RESULT_COMPUTED) &&
              "Poll ended"}
            {status === PollStatus.OPEN && (
              <span className={styles.timeInfo}>
                Time left: {formatTimeRemaining(timeRemaining)}
              </span>
            )}
            {status === PollStatus.NOT_STARTED && (
              <span className={styles.timeInfo}>
                Starts in: {formatTimeRemaining(timeRemaining)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollHeader;
