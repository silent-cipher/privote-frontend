"use client";
import styles from "~~/styles/userPoll.module.css";
import { useParams } from "next/navigation";
import PollDetails2 from "~~/components/PollDetails2";
import PollDetail from "~~/components/PollDetails";
import { useAuthUserOnly } from "~~/hooks/useAuthUserOnly";

const UserPoll = () => {
  useAuthUserOnly({ inverted: false });
  const params = useParams();
  const pollId = params.id;
  return <PollDetails2 id={BigInt(Number(pollId))} />;
};

export default UserPoll;
