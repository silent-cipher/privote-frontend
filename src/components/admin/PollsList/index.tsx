import { Poll } from "~~/types/poll";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PollsListItem } from "./components";
import styles from "./index.module.css";
import Image from "next/image";

interface PollsListProps {
  polls: Poll[] | undefined;
  isLoadingPolls: boolean;
}

const PollsList = ({ polls, isLoadingPolls }: PollsListProps) => {
  const { address, isDisconnected } = useAccount();

  if (isDisconnected) {
    return (
      <div className={styles["empty-state"]}>
        <h3>Connect Your Wallet</h3>
        <p>Please connect your wallet to view your polls</p>
        <div className={styles["connect-button"]}>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (isLoadingPolls) {
    return (
      <div className={styles["spinner-wrapper"]}>
        <div className="spinner large"></div>
      </div>
    );
  }

  const userPolls =
    polls?.filter((poll) => poll.pollDeployer === address) || [];

  if (userPolls.length === 0) {
    return (
      <div className={styles["empty-state"]}>
        <h3>No Polls Found</h3>
        <p>You haven't created any polls yet</p>
      </div>
    );
  }

  return (
    <div className={styles["poll-wrapper"]}>
      <div className={styles["polls-container"]}>
        <h2>Polls</h2>
        <ul className={styles["polls-list"]}>
          {userPolls.map((poll, index) => (
            <PollsListItem key={poll.id || index} poll={poll} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PollsList;
