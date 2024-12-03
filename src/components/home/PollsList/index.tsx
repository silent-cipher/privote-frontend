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
  console.log(polls);
  return (
    <ul className={styles["polls-list"]}>
      {!polls || isLoadingPolls ? (
        <div className={styles["spinner-wrapper"]}>
          <div className="spinner large"></div>
        </div>
      ) : null}
      {polls &&
        polls.map((poll, index) => <PollsListItem key={index} poll={poll} />)}
    </ul>
  );
};

export default PollsList;
