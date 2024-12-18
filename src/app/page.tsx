"use client";
import { useState } from "react";
import { useFetchPolls } from "~~/hooks/useFetchPolls";
import styles from "~~/styles/page.module.css";
import { Pagination, PollsList } from "~~/components/home";
import Button from "~~/components/ui/Button";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const {
    totalPolls,
    polls,
    refetch: refetchPolls,
    isLoading: isPollsLoading,
    error,
  } = useFetchPolls(currentPage, limit, false);

  if (error) {
    return (
      <div className={styles["main-page"]}>
        <div className={styles["error-state"]}>
          <h3>Something went wrong</h3>
          <p>Failed to load polls. Please try again later.</p>
          <Button className={styles["retry-btn"]} action={refetchPolls}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const showPagination = polls && polls.length > 0 && totalPolls > limit;

  return (
    <div className={styles["main-page"]}>
      <div className={styles["poll-wrapper"]}>
        <div className={styles["polls-container"]}>
          <h2>Polls</h2>
          <PollsList polls={polls} isLoadingPolls={isPollsLoading} />
          {showPagination && (
            <div className={styles["pagination-container"]}>
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalItems={totalPolls}
                itemsPerPage={limit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
