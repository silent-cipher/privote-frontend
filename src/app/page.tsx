"use client";
import { useState } from "react";
import { useFetchPolls } from "~~/hooks/useFetchPolls";
import styles from "~~/styles/page.module.css";
import { Hero, Pagination, PollsList } from "~~/components/home";
import Button from "~~/components/ui/Button";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import { LogInWithAnonAadhaar } from "@anon-aadhaar/react";
import { Poll } from "~~/types/poll";
import LoaderModal from "~~/components/ui/LoaderModal";

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
  const [anonAadhaar] = useAnonAadhaar();
  // const polls: Poll[] = [];
  // const totalPolls = 0;
  // const isPollsLoading = false;
  // const error = null;
  // const refetchPolls = () => {};

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
      <Hero />
    </div>
  );
}
