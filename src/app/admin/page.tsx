"use client";
import { useAccount } from "wagmi";
import styles from "~~/styles/admin.module.css";
import Button from "~~/components/ui/Button";
import { useState } from "react";
import { CreatePollForm, PollsList } from "~~/components/admin";
import { useFetchUserPolls } from "~~/hooks/useFetchUserPolls";
import { Pagination } from "~~/components/home";

export default function Admin() {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const { address, isConnected } = useAccount();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const {
    totalPolls,
    polls,
    refetch: refetchPolls,
    isLoading,
    error,
  } = useFetchUserPolls(currentPage, limit, false, address);

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
            <PollsList
              polls={polls}
              isLoading={isLoading}
              refetch={refetchPolls}
              error={error}
            />
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
