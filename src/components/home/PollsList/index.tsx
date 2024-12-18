import { Poll } from "~~/types/poll";
import { PollsListItem } from "./components";
import styles from "./index.module.css";

interface PollsListProps {
  polls: Poll[] | undefined;
  isLoadingPolls: boolean;
}

const PollsList = ({ polls, isLoadingPolls }: PollsListProps) => {
  if (isLoadingPolls) {
    return (
      <div className={styles["spinner-wrapper"]}>
        <div className="spinner large"></div>
      </div>
    );
  }

  if (!polls || polls.length === 0) {
    return (
      <div className={styles["empty-state"]}>
        <h3>No Polls Found</h3>
        <p>There are no polls available at the moment.</p>
      </div>
    );
  }

  return (
    <div className={styles["polls-container"]}>
      <ul className={styles["polls-list"]}>
        {polls.map((poll) => (
          <PollsListItem key={poll.id} poll={poll} />
        ))}
      </ul>
    </div>
  );
};

export default PollsList;
