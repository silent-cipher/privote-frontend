"use client";
import { useState } from "react";
import { useFetchPolls } from "~~/hooks/useFetchPolls";
import styles from "~~/styles/page.module.css";
import { Pagination, PollsList, Hero } from "~~/components/home";

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const {
    totalPolls,
    polls,
    refetch: refetchPolls,
    isLoading: isPollsLoading,
  } = useFetchPolls(currentPage, limit);

  return (
    <div className={styles["main-page"]}>
      {/* <Hero /> */}
      <div className={styles["poll-wrapper"]}>
        <div className={styles["polls-container"]}>
          <h2>Polls</h2>
          <PollsList polls={polls} isLoadingPolls={isPollsLoading} />
          <div className={styles["pagination-container"]}>
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalItems={totalPolls}
              itemsPerPage={limit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
