"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import styles from "~~/styles/publish.module.css";
import { useFetchPoll } from "~~/hooks/useFetchPoll";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export default function Publish() {
  const params = useParams();
  const pollId = params.id;
  const [dockerConfig, setDockerConfig] = useState(0);

  const { data: poll, error, isLoading } = useFetchPoll(BigInt(Number(pollId)));

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "Privote",
    functionName: "updatePollTallyCID",
    args: [undefined, undefined],
  });

  if (isLoading) {
    return <div>Loading...</div>;
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
          <div className={styles["config-wrapper"]}>
            <div
              className={styles["config-option"]}
              onClick={() => setDockerConfig(2)}
            >
              <div
                className={`${styles.dot} ${
                  dockerConfig === 2 ? styles.selected : ""
                }`}
              ></div>
              <div className={styles["gen-container"]}>
                <p className={styles.text}>Run Docker image Locally</p>
                {dockerConfig === 2 && (
                  <div className={styles["public-input-container"]}>
                    <p>First, clone and run the Docker image locally</p>
                    <div className={styles.command}>
                      git clone https://github.com/example/vote-publisher-docker{" "}
                      <br />
                      cd vote-publisher-docker <br />
                      docker build -t vote-publisher . <br />
                      docker run -p 8080:8080 vote-publisher <br />
                    </div>
                    <p className={styles.text}>
                      Once the Docker container is running, use the form below
                      to publish results
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.box}></div>
        </div>
      </div>
    </div>
  );
}
