"use client";
import { useState } from "react";
import { useFetchPolls } from "~~/hooks/useFetchPolls";
import styles from "~~/styles/page.module.css";
import { Hero } from "~~/components/home";
import Button from "~~/components/ui/Button";
import Trending from "~~/components/home/Trending";
import Footer from "~~/components/Footer";
import { AuthType, PollStatus, PollType } from "~~/types/poll";

export default function Home() {
  const {
    totalPolls,
    polls,
    refetch: refetchPolls,
    isLoading: isPollsLoading,
    error,
  } = useFetchPolls(1, 100, false);

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

  // TODO: Remove filter for Weighted Multiple Vote with new contract deployment
  const filteredPolls = polls
    ? polls.filter((poll) => poll.status === PollStatus.OPEN)
    : [];

  return (
    <div className={styles["main-page"]}>
      <Hero />
      {!isPollsLoading && filteredPolls.length > 0 && (
        <Trending
          totalPolls={totalPolls}
          polls={filteredPolls}
          isLoading={isPollsLoading}
          error={error}
        />
      )}
      <Footer />
    </div>
  );
}
