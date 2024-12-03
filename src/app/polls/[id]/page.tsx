"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "~~/styles/pollDetails.module.css";
import { useParams } from "next/navigation";
import { PollDetails } from "~~/components/Poll";
import { useAuthContext } from "~~/contexts/AuthContext";
import { useAuthUserOnly } from "~~/hooks/useAuthUserOnly";

const UserPoll = () => {
  const { isRegistered } = useAuthContext();
  const params = useParams();
  const pollId = params.id;
  return (
    <div className={styles.container}>
      <Link href={"/"} className={styles.back}>
        <Image src="/arrow-left.svg" alt="arrow left" width={27} height={27} />
      </Link>
      <PollDetails
        id={BigInt(Number(pollId))}
        isUserRegistered={isRegistered}
      />
    </div>
  );
};

export default UserPoll;
