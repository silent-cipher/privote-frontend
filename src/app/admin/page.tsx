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
import { ConnectButton } from "@rainbow-me/rainbowkit";

const AuthTypeMapping: { [key: string]: string } = {
  wc: "worldcoin",
  anon: "anon-icon",
  nfc: "nfc-icon",
};
export default function Admin() {
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const { address, isDisconnected, isConnected } = useAccount();

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
                {!polls || polls.length === 0 ? (
                  <div className={styles["spinner-wrapper"]}>
                    <div className="spinner large"></div>
                  </div>
                ) : (
                  isDisconnected && (
                    <div className={styles["spinner-wrapper"]}>
                      <ConnectButton />
                    </div>
                  )
                )}
                {/* {isDisconnected && <ConnectButton />} */}
                {polls &&
                  polls
                    .filter((poll) => poll.pollDeployer === address)
                    .map((poll, index) => (
                      <li className={styles["polls-list-item"]} key={index}>
                        <Link href={`/polls/${poll.id}`}>
                          <div
                            className={`${styles["poll-status"]} ${
                              poll.status === PollStatus.OPEN
                                ? styles.live
                                : poll.status === PollStatus.NOT_STARTED
                                ? styles.notStarted
                                : styles.ended
                            }`}
                          >
                            <Circle />{" "}
                            {poll.status === PollStatus.OPEN
                              ? "Live now"
                              : poll.status === PollStatus.NOT_STARTED
                              ? "Not Started"
                              : "Ended"}
                          </div>
                          <div className={styles.container}>
                            <div className={styles.left}>
                              <h2>
                                {poll.name}{" "}
                                {AuthTypeMapping[poll.authType] && (
                                  <Image
                                    src={`/${
                                      AuthTypeMapping[poll.authType]
                                    }.svg`}
                                    width={26}
                                    height={26}
                                    alt="icon"
                                  />
                                )}
                              </h2>
                              <p>{Number(poll.numOfOptions)} Candidates</p>
                              {poll.status === PollStatus.CLOSED && (
                                <Link
                                  href={`/polls/${poll.id}/publish`}
                                  className={styles["poll-btn"]}
                                >
                                  <p>Publish Results</p>
                                </Link>
                              )}
                              {poll.status === PollStatus.RESULT_COMPUTED && (
                                <Link
                                  href={`/polls/${poll.id}`}
                                  className={styles["poll-btn"]}
                                >
                                  <p>View Results</p>
                                </Link>
                              )}
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
          {!showCreatePoll && isConnected && (
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
