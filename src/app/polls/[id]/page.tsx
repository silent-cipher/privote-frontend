"use client";
import styles from "~~/styles/userPoll.module.css";
import { useParams } from "next/navigation";
import PollDetails2 from "~~/components/PollDetails2";

const UserPoll = () => {
  const params = useParams();
  const pollId = params.id;
  return <PollDetails2 id={BigInt(Number(pollId))} />;
};

export default UserPoll;
