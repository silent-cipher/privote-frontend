import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogInWithAnonAadhaar } from "@anon-aadhaar/react";
import styles from "~~/styles/userPoll.module.css";
import Button from "~~/components/ui/Button";
import { PollStatus } from "~~/types/poll";
import { useAccount } from "wagmi";

interface PollHeaderProps {
  pollName: string;
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

export const PollHeader = ({
  pollName,
  status,
  isConnected,
  isUserRegistered,
  anonAadhaarStatus,
  onRegister,
  isRegistering,
}: PollHeaderProps) => {
  const { address } = useAccount();
  return (
    <div className={styles.header}>
      <h1 className={styles.heading}>{pollName}</h1>
      <div className={styles.end}>
        {!isConnected && <ConnectButton />}
        {isConnected && (
          <LogInWithAnonAadhaar nullifierSeed={4534} signal={address} />
        )}

        {!isUserRegistered &&
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

        <div className={styles.status}>
          {status ? PollStatusMapping[status] : ""}
        </div>
      </div>
    </div>
  );
};

export default PollHeader;
