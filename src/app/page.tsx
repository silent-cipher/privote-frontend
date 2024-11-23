"use client";
import Image from "next/image";
import { PollStatus } from "~~/types/poll";
import { useState } from "react";
import { useFetchPolls } from "~~/hooks/useFetchPolls";
import Button from "~~/components/ui/Button";
import styles from "~~/styles/page.module.css";
import { useAuthContext } from "~~/contexts/AuthContext";
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { Circle } from "./Circle";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Pagination from "~~/components/Pagination";

const AuthTypeMapping: { [key: string]: string } = {
  wc: "worldcoin",
  anon: "anon-icon",
  nfc: "nfc-icon",
};

const Polls = [
  {
    name: "US Elections 2024",
    candidates: 2,
    verificationType: "wc",
    startTime: "19:56, 08/09/2024",
    endTime: "19:56, 08/09/2024",
    status: "live",
  },
  {
    name: "US Elections 2024",
    candidates: 2,
    verificationType: "anon",
    startTime: "19:56, 08/09/2024",
    endTime: "19:56, 08/09/2024",
    status: "not-started",
  },
  {
    name: "US Elections 2024",
    candidates: 2,
    verificationType: "nfc",
    startTime: "19:56, 08/09/2024",
    endTime: "19:56, 08/09/2024",
    status: "starting-soon",
  },
];

export default function Home() {
  const { keypair, isRegistered, generateKeypair } = useAuthContext();
  const [AnonAadhaar] = useAnonAadhaar();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const {
    totalPolls,
    polls,
    refetch: refetchPolls,
    isLoading: isPollsLoading,
  } = useFetchPolls(currentPage, limit);
  const { address, isDisconnected, isConnected } = useAccount();

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "Privote",
    functionName: "signUp",
    args: [
      keypair?.pubKey.asContractParam() as { x: bigint; y: bigint },
      "0x",
      "0x",
    ],
  });

  async function register() {
    if (!keypair) return;

    try {
      await writeAsync({
        args: [
          keypair.pubKey.asContractParam() as { x: bigint; y: bigint },
          "0x",
          "0x",
        ],
      });
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div className={styles["main-page"]}>
      <div className={styles["poll-wrapper"]}>
        <div className={styles["polls-container"]}>
          <h2>Polls</h2>
          <ul className={styles["polls-list"]}>
            {!polls || isPollsLoading ? (
              <div className={"spinner-wrapper"}>
                <div className="spinner large"></div>
              </div>
            ) : null}
            {polls ? (
              polls.map((poll, index) => (
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
                              src={`/${AuthTypeMapping[poll.authType]}.svg`}
                              width={26}
                              height={26}
                              alt="icon"
                            />
                          )}
                        </h2>
                        <p>{Number(poll.numOfOptions)} Candidates</p>
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
              ))
            ) : (
              <p className={styles.loading}>Loading...</p>
            )}
          </ul>
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
      {/* <div className={styles.hero}>
        <div className={styles.status}>
          Privote: the all new way to create polls
        </div>
        <h1 className={styles.heading}>Revolutionizing the Future of Voting</h1>
        <p className={styles.description}>
          Register now to create polls, participate in elections, and make your
          voice heard in the decision-making process.
        </p>
        <Button action={register}>
          {isLoading ? (
            <div className={`spinner ${styles["reg-spinner"]}`}></div>
          ) : (
            "Register"
          )}
        </Button>
      </div> */}
    </div>
  );
}
