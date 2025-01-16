"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "~~/styles/pollDetails.module.css";
import { useParams, useRouter } from "next/navigation";
import { useChainId } from "wagmi";
import { PollDetails } from "~~/components/Poll";
import PollContextProvider, { usePollContext } from "~~/contexts/PollContext";
import Button from "~~/components/ui/Button";

const Page = () => {
  const router = useRouter();
  const chainId = useChainId();
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }
    router.push("/polls");
  }, [chainId]);

  return (
    <PollContextProvider>
      <UserPoll />
    </PollContextProvider>
  );
};

const UserPoll = () => {
  const { isRegistered, isError, isLoading } = usePollContext();
  const params = useParams();
  const pollId = params.id;

  if (isError) {
    return (
      <div className={styles.container}>
        <Link href={"/polls"} className={styles.back}>
          <Image
            src="/arrow-left.svg"
            alt="arrow left"
            width={27}
            height={27}
          />
        </Link>
        <div className={styles["error-state"]}>
          <h3>Failed to Load Poll</h3>
          <p>We couldn't load the poll details. Please try again later.</p>
          <Button
            className={styles["retry-btn"]}
            action={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Link href={"/"} className={styles.back}>
          <Image
            src="/arrow-left.svg"
            alt="arrow left"
            width={27}
            height={27}
          />
        </Link>
        <div className={styles["loading-state"]}>
          <div className="spinner large"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["main-container"]}>
      <Link href={"/polls"} className={styles.back}>
        <Image src="/arrow-left.svg" alt="arrow left" width={27} height={27} />
      </Link>
      <PollDetails
        id={BigInt(Number(pollId))}
        isUserRegistered={isRegistered}
      />
    </div>
  );
};

export default Page;
