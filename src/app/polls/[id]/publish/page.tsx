"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import styles from "~~/styles/publish.module.css";
import { useFetchPoll } from "~~/hooks/useFetchPoll";
import usePublishResults from "~~/hooks/usePublishResults";
import { DockerConfig, BackendConfig } from "~~/components/Poll/PublishConfig";
import MessageProcessor from "~~/abi/MessageProcessor";
import { useContractRead } from "wagmi";
import { EMode } from "~~/types/poll";

export default function Publish() {
  const params = useParams();
  const searchParams = useSearchParams();
  const pollId = params.id as string;
  const authType = searchParams.get("authType") as string;
  const {
    data: poll,
    error,
    isLoading,
  } = useFetchPoll(
    BigInt(Number(pollId)),
    authType === "none" ? "PrivoteFreeForAll" : "PrivoteAnonAadhaar"
  );

  const {
    form,
    btnText,
    dockerConfig,
    setDockerConfig,
    handleFormChange,
    publishWithBackend,
    publishWithDocker,
  } = usePublishResults(pollId, authType, poll?.isQv as EMode);

  if (error) {
    return <div>Error loading poll details</div>;
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className="spinner-wrapper">
          <span className="spinner large"></span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href={"/"} className={styles.back}>
        <Image src="/arrow-left.svg" alt="arrow left" width={27} height={27} />
      </Link>
      <div className={styles.details}>
        <h2 className={styles.heading}>
          Choose how you want to publish poll results
        </h2>
        <div className={styles["card-wrapper"]}>
          <DockerConfig
            isSelected={dockerConfig === 1}
            onClick={() => setDockerConfig(1)}
            cidValue={form.cid}
            onFormChange={handleFormChange}
            onPublish={publishWithDocker}
          />
          <BackendConfig
            isSelected={dockerConfig === 2}
            onClick={() => setDockerConfig(2)}
            privKeyValue={form.privKey}
            onFormChange={handleFormChange}
            onPublish={publishWithBackend}
            btnText={btnText}
          />
        </div>
      </div>
    </div>
  );
}
