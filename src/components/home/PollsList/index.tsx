import { Poll } from "~~/types/poll";
import { PollsListItem } from "./components";
import styles from "./index.module.css";

interface PollsListProps {
  polls: Poll[] | undefined;
  isLoadingPolls: boolean;
}

const PollsList = ({ polls, isLoadingPolls }: PollsListProps) => {
  return (
    <ul className={styles["polls-list"]}>
      {!polls && isLoadingPolls ? (
        <div className={styles["spinner-wrapper"]}>
          <div className="spinner large"></div>
        </div>
      ) : null}
      {!polls && !isLoadingPolls && (
        <div className={styles.text}>No Polls Found</div>
      )}
      {polls &&
        polls.map((poll, index) => <PollsListItem key={index} poll={poll} />)}
    </ul>
  );
};

export default PollsList;
