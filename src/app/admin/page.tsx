"use client";
import Image from "next/image";
import { useAccount } from "wagmi";
import styles from "~~/styles/admin.module.css";
import Button from "~~/components/ui/Button";
import { useState } from "react";
import { CreatePollForm, PollsList } from "~~/components/admin";
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
  const [limit] = useState(25);
  const {
    totalPolls,
    polls,
    refetch: refetchPolls,
    isLoading,
  } = useFetchPolls(currentPage, limit);
  const [selectedPollForStatusModal, setSelectedPollForStatusModal] =
    useState<Poll>();

  return (
    <div className={styles.wrapper}>
      <div className={styles["admin-page"]}>
        {!showCreatePoll && (
          <PollsList polls={polls} isLoadingPolls={isLoading} />
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
