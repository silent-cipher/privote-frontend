import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogInWithAnonAadhaar } from "@anon-aadhaar/react";
import styles from "~~/styles/userPoll.module.css";
import Button from "~~/components/ui/Button";
import { PollStatus } from "~~/types/poll";
import { useAccount } from "wagmi";

interface PollHeaderProps {
  authType: string;
  pollName: string;
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

const PollStatusMapping = {
  [PollStatus.NOT_STARTED]: "Not Started",
  [PollStatus.OPEN]: "Live",
  [PollStatus.CLOSED]: "Pole ended",
  [PollStatus.RESULT_COMPUTED]: "Pole ended",
};

function formatTimeRemaining(time: number) {
  if (time <= 0) return "Time expired";

  const days = Math.floor(time / 86400);
  const hours = Math.floor((time % 86400) / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  // If days exist, show only days
  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"}`;
  }

  // If hours exist but no days, show only hours
  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  // If minutes exist but no days/hours, show minutes and seconds
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  // If only seconds remain
  return `${seconds}s`;
}

export const PollHeader = ({
  authType,
  pollName,
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
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.heading}>{pollName}</h1>
        <div className={styles.end}>
          {!isConnected && <ConnectButton />}
          {isConnected && authType === "anon" && status === PollStatus.OPEN && (
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
          {authType === "none" &&
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
            {status ? PollStatusMapping[status] : ""}
          </div>
        </div>
      </div>
      <div className={styles.descriptionWrapper}>
        {pollDescription && (
          <p className={styles.description}>{pollDescription}</p>
        )}
        <div className={styles.pollTiming}>
          {status === PollStatus.OPEN && (
            <span className={styles.timeInfo}>
              Ends in:{" "}
              {formatTimeRemaining(Number(pollEndTime) - Date.now() / 1000)}
            </span>
          )}
          {status === PollStatus.NOT_STARTED && (
            <span className={styles.timeInfo}>
              Starts in:{" "}
              {formatTimeRemaining(Number(pollStartTime) - Date.now() / 1000)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollHeader;
