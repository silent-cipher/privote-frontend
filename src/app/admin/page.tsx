"use client";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import styles from "~~/styles/admin.module.css";
import Button from "~~/components/ui/Button";
import { useState, useEffect, Suspense } from "react";
import { CreatePollForm, PollsList } from "~~/components/admin";
import { useFetchUserPolls } from "~~/hooks/useFetchUserPolls";
import { Pagination } from "~~/components/home";

export default function Admin() {
  return (
    <div className={styles.wrapper}>
      <Suspense fallback={<div>Loading...</div>}>
        <AdminPoll />
      </Suspense>
    </div>
  );
}

const AdminPoll = () => {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    if (isConnected) {
      if (searchParams.get("action") === "create") {
        setShowCreatePoll(true);
      }
    }
  }, [isConnected]);

  if (error) {
    return (
      <div className={styles["admin-page"]}>
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
  return (
    <div className={styles["admin-page"]}>
      <div className={styles.header}>
        {!showCreatePoll && isConnected && (
          <Button className={styles.btn} action={() => setShowCreatePoll(true)}>
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
  );
};
