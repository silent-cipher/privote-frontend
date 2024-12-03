import { Poll, PollStatus } from "~~/types/poll";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PollsListItem } from "./components";
import styles from "./index.module.css";

interface PollsListProps {
  polls: Poll[] | undefined;
  isLoadingPolls: boolean;
}

const PollsList = ({ polls, isLoadingPolls }: PollsListProps) => {
  const { address, isDisconnected, isConnected } = useAccount();
  return (
    <div className={styles["poll-wrapper"]}>
      <div className={styles["polls-container"]}>
        <h2>Polls</h2>
        <ul className={styles["polls-list"]}>
          {!polls || isLoadingPolls ? (
            <div className={styles["spinner-wrapper"]}>
              <div className="spinner large"></div>
            </div>
          ) : (
            isDisconnected && (
              <div className={styles["spinner-wrapper"]}>
                <ConnectButton />
              </div>
            )
          )}
          {polls &&
            polls
              .filter((poll) => poll.pollDeployer === address)
              .map((poll, index) => <PollsListItem key={index} poll={poll} />)}
        </ul>
      </div>
    </div>
  );
};

export default PollsList;
