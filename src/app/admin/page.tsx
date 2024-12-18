"use client";
import { useAccount } from "wagmi";
import styles from "~~/styles/admin.module.css";
import Button from "~~/components/ui/Button";
import { useState } from "react";
import { CreatePollForm, PollsList } from "~~/components/admin";
import { useFetchPolls } from "~~/hooks/useFetchPolls";
import { Pagination } from "~~/components/home";
import Image from "next/image";

export default function Admin() {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const { isConnected } = useAccount();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const {
    totalPolls,
    polls,
    refetch: refetchPolls,
    isLoading,
    error,
  } = useFetchPolls(currentPage, limit, false);

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles["admin-page"]}>
          <div className={styles["error-state"]}>
            <h3>Something went wrong</h3>
            <p>Failed to load polls. Please try again later.</p>
            <Button className={styles["retry-btn"]} action={refetchPolls}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles["admin-page"]}>
        <div className={styles.header}>
          {!showCreatePoll && isConnected && (
            <Button
              className={styles.btn}
              action={() => setShowCreatePoll(true)}
            >
              Create Poll
            </Button>
          )}
        </div>
        {!showCreatePoll ? (
          <>
            <PollsList polls={polls} isLoadingPolls={isLoading} />
            {polls && polls.length > 0 && (
              <div className={styles["pagination-container"]}>
                <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalItems={totalPolls}
                  itemsPerPage={limit}
                />
              </div>
            )}
          </>
        ) : (
          <CreatePollForm
            refetchPolls={refetchPolls}
            onClose={() => {
              setShowCreatePoll(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
