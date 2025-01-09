import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PollsListItem } from "./components";
import styles from "./index.module.css";
import { Poll } from "~~/types/poll";

interface IPollsList {
  polls: Poll[] | undefined;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const PollsList = ({ polls, isLoading, error, refetch }: IPollsList) => {
  const { isDisconnected } = useAccount();

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

  if (isLoading || error) {
    return (
      <div className={styles["spinner-wrapper"]}>
        <div className="spinner large"></div>
      </div>
    );
  }

  if (!isLoading && !error && polls && polls.length === 0) {
    return (
      <div className={styles["empty-state"]}>
        <h3>No Polls Found</h3>
        <p>There are no polls created by you</p>
      </div>
    );
  }

  return (
    <div className={styles["poll-wrapper"]}>
      <div className={styles["polls-container"]}>
        <h2>Polls</h2>
        <ul className={styles["polls-list"]}>
          {polls &&
            polls.map((poll) => (
              <PollsListItem key={poll.pollContracts.poll} poll={poll} />
            ))}
        </ul>
      </div>
    </div>
  );
};

export default PollsList;
