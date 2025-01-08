import { Poll } from "~~/types/poll";
import { PollsListItem } from "./components";
import styles from "./index.module.css";

interface PollsListProps {
  polls: Poll[] | undefined;
  isLoadingPolls: boolean;
}

const PollsList = ({ polls, isLoadingPolls }: PollsListProps) => {
  if (!polls || polls.length === 0 || isLoadingPolls) {
    return (
      <div className={styles["spinner-wrapper"]}>
        <div className="spinner large"></div>
      </div>
    );
  }

  return (
    <div className={styles["polls-container"]}>
      <ul className={styles["polls-list"]}>
        {polls.map((poll) => (
          <PollsListItem key={poll.pollContracts.poll} poll={poll} />
        ))}
      </ul>
    </div>
  );
};

export default PollsList;
