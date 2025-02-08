import { Poll, PollType, AuthType, PollStatus } from "~~/types/poll";
import { PollsListItem } from "./components";
import styles from "./index.module.css";

interface PollsListProps {
  polls: Poll[] | undefined;
  isLoadingPolls: boolean;
  error: any;
}

const PollsList = ({ polls, isLoadingPolls, error }: PollsListProps) => {
  if (isLoadingPolls) {
    return (
      <div className={styles["spinner-wrapper"]}>
        <div className="spinner large"></div>
      </div>
    );
  }

  if (!isLoadingPolls && !error && polls && polls.length === 0) {
    return (
      <div className={styles["empty-state"]}>
        <h3>No Polls Found</h3>
        <p>There are no polls for you</p>
      </div>
    );
  }

  // TODO: Remove filter for Weighted Multiple Vote with new contract deployment
  const filteredPolls = polls
    ? polls.filter((poll) => {
        const metadata = JSON.parse(poll.metadata);
        return (
          (metadata.pollType !== PollType.WEIGHTED_MULTIPLE_VOTE ||
            poll.id !== BigInt(0) ||
            poll.authType !== AuthType.ANON) &&
          poll.status === PollStatus.OPEN
        );
      })
    : [];

  return (
    <div className={styles["polls-container"]}>
      <ul className={styles["polls-list"]}>
        {filteredPolls &&
          filteredPolls.map((poll) => (
            <PollsListItem key={poll.pollContracts.poll} poll={poll} />
          ))}
      </ul>
    </div>
  );
};

export default PollsList;
