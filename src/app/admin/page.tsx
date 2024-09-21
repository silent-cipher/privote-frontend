"use client";
import Image from "next/image";
import { useAccount } from "wagmi";
import styles from "~~/styles/admin.module.css";
import Button from "~~/components/ui/Button";
import { useState } from "react";
import { CreatePollForm } from "~~/components/admin";
import { useFetchPolls } from "~~/hooks/useFetchPolls";
import { Poll, PollStatus } from "~~/types/poll";
import { Circle } from "../Circle";
import { Keypair } from "maci-domainobjs";
import Link from "next/link";

export default function Admin() {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const { address } = useAccount();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const {
    totalPolls,
    polls,
    refetch: refetchPolls,
  } = useFetchPolls(currentPage, limit);
  const [selectedPollForStatusModal, setSelectedPollForStatusModal] =
    useState<Poll>();

  return (
    <div className={styles.wrapper}>
      <div className={styles["admin-page"]}>
        {!showCreatePoll && (
          <div className={styles["poll-wrapper"]}>
            <div className={styles["polls-container"]}>
              <h2>Polls</h2>
              <ul className={styles["polls-list"]}>
                {polls &&
                  polls
                    .filter((poll) => poll.pollDeployer === address)
                    .map((poll, index) => (
                      <li className={styles["polls-list-item"]} key={index}>
                        <Link href={`/admin/poll/${poll.id}`}>
                          <div
                            className={`${styles["poll-status"]} ${
                              poll.status === PollStatus.OPEN
                                ? styles.live
                                : poll.status === PollStatus.NOT_STARTED
                                ? styles.notStarted
                                : styles.startingSoon
                            }`}
                          >
                            <Circle />{" "}
                            {poll.status === PollStatus.OPEN
                              ? "Live now"
                              : poll.status === PollStatus.NOT_STARTED
                              ? "Not Started"
                              : "Starting Soon"}
                          </div>
                          <div className={styles.container}>
                            <div className={styles.left}>
                              <h2>
                                {poll.name}{" "}
                                <Image
                                  src="/worldcoin.svg"
                                  width={31}
                                  height={31}
                                  alt="icon"
                                />
                              </h2>
                              <p>{Number(poll.numOfOptions)} Candidates</p>
                            </div>
                            <div className={styles.right}>
                              <p>
                                <span>Start Time</span>
                                <span>:</span>
                                <span>
                                  {new Date(Number(poll.startTime) * 1000)
                                    .toLocaleString("sv")
                                    .replace(" ", ", ")
                                    .slice(0, -3)}
                                </span>
                              </p>
                              <p>
                                <span>End Time</span>
                                <span>:</span>
                                <span>
                                  {new Date(Number(poll.endTime) * 1000)
                                    .toLocaleString("sv")
                                    .replace(" ", ", ")
                                    .slice(0, -3)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
              </ul>
            </div>
          </div>
        )}
        <div className={styles.header}>
          {!showCreatePoll && (
            <Button
              className={styles.btn}
              action={() => setShowCreatePoll(true)}
            >
              Create Poll
            </Button>
          )}
        </div>
        {showCreatePoll && (
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
