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
import { Pagination, PollsList } from "~~/components/home";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

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

  const { data } = useScaffoldContractRead({
    contractName: "Privote",
    functionName: "nextPollId",
  });

  console.log(data);

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
      <div className={styles.hero}>
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
      </div>
    </div>
  );
}
