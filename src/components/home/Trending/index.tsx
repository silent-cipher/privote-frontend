"use client";
import styles from "./index.module.css";
import PollsList from "../PollsList";
import { Poll, PollStatus } from "~~/types/poll";

interface TrendingProps {
  totalPolls: number;
  polls?: Poll[];
  isLoading: boolean;
  error: any;
}

const Trending = ({ totalPolls, polls, isLoading, error }: TrendingProps) => {
  const livePolls =
    polls?.filter((poll) => poll.status === PollStatus.OPEN) || [];
  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <h4>Trending Polls</h4>
      </div>
      <div className={styles["polls-container"]}>
        <PollsList polls={livePolls} isLoadingPolls={isLoading} error={error} />
        {/* {showPagination && (
          <div className={styles["pagination-container"]}>
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalItems={totalPolls}
              itemsPerPage={limit}
            />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Trending;
