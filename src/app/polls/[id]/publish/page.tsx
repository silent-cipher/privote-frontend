"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import styles from "~~/styles/publish.module.css";
import { useFetchPoll } from "~~/hooks/useFetchPoll";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import WithoutImageInput from "~~/components/admin/CreatePollForm/components/WithoutImageInput";

const url = "http://localhost:8080/generate-tally";

export default function Publish() {
  const params = useParams();
  const pollId = params.id;
  const [dockerConfig, setDockerConfig] = useState(0);
  const [form, setForm] = useState({
    cid: "",
    privKey: "",
  });
  const [btnText, setBtnText] = useState("Publish Results");
  const router = useRouter();

  const { data: poll, error, isLoading } = useFetchPoll(BigInt(Number(pollId)));

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "Privote",
    functionName: "updatePollTallyCID",
    args: [undefined, undefined],
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitToBackend = async () => {
    try {
      //   console.log(form);
      setBtnText("Publishing...");
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          pollId: pollId,
          coordinatoreKey: form.privKey,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      // console.log(data);

      if (response.ok) {
        await writeAsync({
          args: [pollId, data.cid],
        });
      }

      setBtnText("Publish Results");

      router.push(`/`);
    } catch (error) {
      setBtnText("Publish Results");
      router.push("/");
      console.log(error);
    }
  };

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
              onClick={() => setDockerConfig(1)}
            >
              <div
                className={`${styles.dot} ${
                  dockerConfig === 1 ? styles.selected : ""
                }`}
              ></div>
              <div className={styles["gen-container"]}>
                <p className={styles["config-heading"]}>
                  Run Docker image Locally
                </p>
                {dockerConfig === 1 && (
                  <div className={styles["public-input-container"]}>
                    <p className={`${styles["bg-card"]} ${styles.text}`}>
                      First, clone and run the Docker image locally
                    </p>
                    <div className={styles.command}>
                      git clone https://github.com/example/vote-publisher-docker{" "}
                      <br />
                      cd vote-publisher-docker <br />
                      docker build -t vote-publisher . <br />
                      docker run -p 8080:8080 vote-publisher <br />
                    </div>
                    <p className={`${styles["bg-card"]} ${styles.text}`}>
                      Once the Docker container is running, use the form below
                      to publish results
                    </p>
                    <WithoutImageInput
                      placeholder="Enter tally file CID..."
                      value={form.cid}
                      onChange={handleFormChange}
                      name={"cid"}
                      className={styles["public-input"]}
                    />
                    <button
                      className={styles["publish-btn"]}
                      disabled={!form.cid}
                    >
                      Publish Results
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles["config-wrapper"]}>
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
                  <p className={styles["config-heading"]}>
                    Use Privote's Backend Services (trust us we're good 🙂)
                  </p>
                  {dockerConfig === 2 && (
                    <div className={styles["public-input-container"]}>
                      <p className={`${styles["bg-card"]} ${styles.text}`}>
                        Use Privote's backend services to publish results
                      </p>
                      <WithoutImageInput
                        placeholder="Enter Coordinator private key..."
                        value={form.privKey}
                        onChange={handleFormChange}
                        name={"privKey"}
                        className={styles["public-input"]}
                      />
                      <button
                        className={styles["publish-btn"]}
                        disabled={!form.privKey}
                        onClick={submitToBackend}
                      >
                        {btnText}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
