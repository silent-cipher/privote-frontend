"use client";
import styles from "./index.module.css";

import Image from "next/image";
import { useState } from "react";
import { PollType, EMode, VerificationType } from "~~/types/poll";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import WithoutImageInput from "./components/WithoutImageInput";
import { Keypair, PubKey } from "maci-domainobjs";
import Button from "~~/components/ui/Button";
import { parseEther } from "viem";

interface CreatePollFormProps {
  onClose: () => void;
  refetchPolls: () => void;
}

const CreatePollForm = ({ onClose, refetchPolls }: CreatePollFormProps) => {
  const [pollData, setPollData] = useState({
    title: "Dummy Title",
    expiry: new Date(),
    maxVotePerPerson: 1,
    pollType: PollType.NOT_SELECTED,
    mode: EMode.QV,
    options: [""],
    keyPair: new Keypair(),
    authType: "none",
    veriMethod: "none",
    pubKey:
      "macipk.a26f6f713fdf9ab73e2bf57662977f8f4539552b3ca0fb2a65654472427f601b",
  });
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [candidateSelection, setCandidateSelection] = useState<string>("");
  const [pollConfig, setPollConfig] = useState(0);
  const [showKeys, setShowKeys] = useState({ show: false, privKey: "" });

  const generateKeyPair = () => {
    const keyPair = new Keypair();

    setPollData((prev) => ({
      ...prev,
      pubKey: keyPair.toJSON().pubKey,
    }));
    setShowKeys({ show: true, privKey: keyPair.toJSON().privKey });
  };

  const handleAddOption = () => {
    setPollData({ ...pollData, options: [...pollData.options, ""] });
  };

  const handlePollTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPollData({ ...pollData, pollType: parseInt(e.target.value) });
  };

  const handleVeriMehodChange = (e: React.ChangeEvent<any>) => {
    setPollData({ ...pollData, authType: e.target.value });
  };

  const handlePubKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPollData({ ...pollData, pubKey: e.target.value });
  };

  const handleMaxVotePerPersonChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPollData({ ...pollData, maxVotePerPerson: parseInt(e.target.value) });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData({ ...pollData, options: newOptions });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPollData({ ...pollData, title: e.target.value });
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPollData({
      ...pollData,
      mode: e.target.value === "0" ? EMode.QV : EMode.NON_QV,
    });
  };

  const handleEditTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitleClick = () => {
    setIsEditingTitle(false);
  };

  function removeOptions(index: number): void {
    const newOptions = [...pollData.options];
    newOptions.splice(index, 1);
    setPollData({ ...pollData, options: newOptions });
  }

  const duration = Math.round(
    (pollData.expiry.getTime() - new Date().getTime()) / 1000
  );

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "Privote",
    functionName: "createPoll",
    args: [
      pollData.title,
      pollData.options || [],
      JSON.stringify({ pollType: pollData.pollType }),
      duration > 0 ? BigInt(duration) : 0n,
      pollData.mode,
      PubKey.deserialize(pollData.pubKey),
      pollData.authType || "anon",
    ],
  });

  async function onSubmit() {
    // validate the inputs
    console.log("creating poll", pollData);
    for (const option of pollData.options) {
      if (!option) {
        // TODO: throw error that the option cannot be blank
        notification.error("Option cannot be blank", {
          showCloseButton: false,
        });
        return;
      }
    }

    console.log("pollData.expiry", pollData.expiry);

    if (duration < 60) {
      // TODO: throw error that the expiry cannot be before atleast 1 min of creation
      notification.error("Expiry cannot be before atleast 1 min of creation", {
        showCloseButton: false,
      });
      return;
    }

    console.log("pollData.pollType", pollData.pollType);
    if (pollData.pollType === PollType.NOT_SELECTED) {
      notification.error("Please select a poll type", {
        showCloseButton: false,
      });
      return;
    }

    // save the poll data to ipfs or find another way for saving the poll type on the smart contract.

    try {
      await writeAsync({ value: parseEther("0.01") });
      refetchPolls();
    } catch (err) {
      console.log(err);
    }

    // onClose();
  }

  return (
    <div className={styles["create-form"]}>
      <button className={styles.back} onClick={onClose}>
        <Image src="/arrow-left.svg" alt="arrow left" width={27} height={27} />
      </button>
      <div className={styles.form}>
        <h1 className={styles.heading}>Create a Poll</h1>
        <div className={styles.container}>
          <input
            className={styles.title}
            value={pollData.title}
            onChange={handleTitleChange}
          />
          <div className={styles["input-field-container"]}>
            <label className={styles.label}>Select the expiry date</label>
            <input
              type="datetime-local"
              className={styles.input}
              placeholder="Enter the title of the poll"
              value={pollData.expiry
                .toLocaleString("sv")
                .replace(" ", "T")
                .slice(0, -3)}
              onChange={(e) =>
                setPollData({ ...pollData, expiry: new Date(e.target.value) })
              }
            />
          </div>
          <div className={styles["input-field-container"]}>
            <label className={styles.label}>Select Poll Type</label>
            <select
              className="select bg-secondary text-neutral w-full rounded-xl"
              value={pollData.pollType}
              onChange={handlePollTypeChange}
            >
              <option disabled value={PollType.NOT_SELECTED}>
                Select Poll Type
              </option>
              <option value={PollType.SINGLE_VOTE}>
                Single Candidate Select
              </option>
              <option value={PollType.MULTIPLE_VOTE}>
                Multiple Candidate Select
              </option>
              <option value={PollType.WEIGHTED_MULTIPLE_VOTE}>
                Weighted-Multiple Candidate Select
              </option>
            </select>
          </div>
          <div className={styles["input-field-container-row"]}>
            <label className={styles.label}>Max. vote per person</label>
            <div className={styles.box}>
              <button
                type="button"
                onClick={() => {
                  if (pollData.maxVotePerPerson > 1) {
                    setPollData({
                      ...pollData,
                      maxVotePerPerson: pollData.maxVotePerPerson - 1,
                    });
                  }
                }}
              >
                <Image src="/minus.svg" alt="minus" width={14} height={14} />
              </button>
              <p>{pollData.maxVotePerPerson}</p>
              <button
                type="button"
                onClick={() => {
                  setPollData({
                    ...pollData,
                    maxVotePerPerson: pollData.maxVotePerPerson + 1,
                  });
                }}
              >
                <Image src="/plus.svg" alt="plus" width={14} height={14} />
              </button>
            </div>
          </div>
          <div className={styles["input-field-container"]}>
            <label className={styles.label}>Select Vote Type</label>
            <select
              className="select bg-secondary text-neutral w-full rounded-xl"
              value={pollData.mode}
              onChange={handleModeChange}
            >
              <option value={EMode.QV}>Quadratic Vote</option>
              <option value={EMode.NON_QV}>Non Quadratic Vote</option>
            </select>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.verification}>
            <h1>Verification</h1>
            <div className={styles["veri-row"]}>
              <button
                type="button"
                className={`${styles["veri-box"]} ${
                  pollData.authType === "none" ? styles.selected : ""
                }`}
                value={"none"}
                onClick={handleVeriMehodChange}
              >
                None
              </button>
              <button
                type="button"
                className={`${styles["veri-box"]} ${
                  pollData.authType === "anon" ? styles.selected : ""
                }`}
                value={"anon"}
                onClick={handleVeriMehodChange}
              >
                <Image
                  width={31}
                  height={31}
                  alt="icon"
                  src={"/anon-icon.svg"}
                />
                Anon - aadhaar
              </button>
              <button
                type="button"
                className={`${styles["veri-box"]} ${
                  pollData.authType === "wc" ? styles.selected : ""
                }`}
                value={"wc"}
                onClick={handleVeriMehodChange}
              >
                <Image
                  width={31}
                  height={31}
                  alt="icon"
                  src={"/worldcoin.svg"}
                />
                Worldcoin-orb
              </button>
              <button
                type="button"
                className={`${styles["veri-box"]} ${
                  pollData.authType === "nfc" ? styles.selected : ""
                }`}
                value={"nfc"}
                onClick={handleVeriMehodChange}
              >
                <Image
                  width={31}
                  height={31}
                  alt="icon"
                  src={"/nfc-icon.svg"}
                />
                NFC
              </button>
            </div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles["candidate-box"]}>
            <div className={styles["candidate-header"]}>
              <h1>Add your candidates</h1>
              {candidateSelection !== "" && (
                <button
                  type="button"
                  className={styles["add-candidate-btn"]}
                  onClick={handleAddOption}
                >
                  <Image
                    src={"/plus-circle.svg"}
                    width={32}
                    height={32}
                    alt="plus circle"
                  ></Image>
                  Add candidate
                </button>
              )}
            </div>
            {candidateSelection === "" && (
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={() => {
                    setPollData({
                      ...pollData,
                      options: ["Candidate 1", "Candidate 2", "Candidate 3"],
                    });
                    setCandidateSelection("withoutImage");
                  }}
                >
                  Add candidates
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateSelection("withImage")}
                >
                  Add candidates with image
                </button>
              </div>
            )}
            {candidateSelection !== "" &&
              pollData.options.map((option, index) => (
                <WithoutImageInput
                  key={index}
                  type="text"
                  placeholder={`Candidate ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              ))}
          </div>
          <div className={styles.divider}></div>
          <div className={styles["poll-config-wrapper"]}>
            <h1>Poll Configuration</h1>
            <div className={styles["poll-config"]}>
              <div className={styles["config-wrapper"]}>
                <div
                  className={styles["config-option"]}
                  onClick={() => setPollConfig(1)}
                >
                  <div
                    className={`${styles.dot} ${
                      pollConfig === 1 ? styles.selected : ""
                    }`}
                  ></div>
                  <div className={styles["gen-container"]}>
                    <p className={styles.text}>
                      We dont trust you, we have coordinator public key
                    </p>
                    {pollConfig === 1 && (
                      <div className={styles["public-input-container"]}>
                        <WithoutImageInput
                          onChange={handlePubKeyChange}
                          value={pollData.pubKey}
                          placeholder="Enter public key..."
                          className={styles["pub-key-input"]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles["config-wrapper"]}>
                <div
                  className={styles["config-option"]}
                  onClick={() => setPollConfig(2)}
                >
                  <div
                    className={`${styles.dot} ${
                      pollConfig === 2 ? styles.selected : ""
                    }`}
                  ></div>
                  <div className={styles["gen-container"]}>
                    <p className={styles.text}>Generate Public Key</p>
                    {pollConfig === 2 && (
                      <div className={styles["public-input-container"]}>
                        <button
                          type="button"
                          className={styles["gen-btn"]}
                          onClick={generateKeyPair}
                          disabled={showKeys.show}
                        >
                          {showKeys.show ? "Keys Generated!" : "Generate Key"}
                        </button>
                        {showKeys.show && (
                          <div className={styles["key-details"]}>
                            <div className={styles["key-container"]}>
                              <p>Public Key: ${pollData.pubKey}</p>
                              <p>Private Key: ${showKeys.privKey}</p>
                            </div>
                            <p className={styles["priv-warning"]}>
                              Please store the private key securely. It will not
                              be stored here.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button
          type="button"
          action={onSubmit}
          className={styles["submit-btn"]}
        >
          Create Poll
        </Button>
      </div>
    </div>
  );
};

export default CreatePollForm;
