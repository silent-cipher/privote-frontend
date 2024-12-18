import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LogInWithAnonAadhaar } from "@anon-aadhaar/react";
import styles from "~~/styles/userPoll.module.css";
import Button from "~~/components/ui/Button";
import { PollStatus } from "~~/types/poll";
import deployedContracts from "~~/contracts/deployedContracts";

interface PollHeaderProps {
  pollName: string;
  status?: PollStatus;
  isConnected: boolean;
  isUserRegistered: boolean;
  anonAadhaarStatus: string;
  onRegister: () => void;
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
}: PollHeaderProps) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.heading}>{pollName}</h1>
      <div className={styles.end}>
        {!isConnected && <ConnectButton />}
        <LogInWithAnonAadhaar
          nullifierSeed={4534}
          signal={deployedContracts[11155111].Privote.address}
        />

        {!isUserRegistered && anonAadhaarStatus === "logged-in" && isConnected && (
          <Button action={onRegister}>Register</Button>
        )}

        <div className={styles.status}>
          {status ? PollStatusMapping[status] : ""}
        </div>
      </div>
    </div>
  );
};

export default PollHeader;
