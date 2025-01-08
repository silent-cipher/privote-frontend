"use client";
import styles from "./index.module.css";

import Image from "next/image";
import { useState } from "react";
import { PollType, EMode, VerificationType } from "~~/types/poll";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { WithImageInput, WithoutImageInput } from "./components";
import { Keypair, PubKey } from "maci-domainobjs";
import Button from "~~/components/ui/Button";
import { bytesToHex, parseEther } from "viem";
import { RxCross2 } from "react-icons/rx";
import { useAccount } from "wagmi";
import { uploadImageToPinata } from "~~/utils/pinata";
import { uploadFileToLighthouse } from "~~/utils/lighthouse";
import CID from "cids";

interface CreatePollFormProps {
  onClose: () => void;
  refetchPolls: () => void;
}

const CreatePollForm = ({ onClose, refetchPolls }: CreatePollFormProps) => {
  const [pollData, setPollData] = useState({
    title: "Dummy Title",
    description: "",
    expiry: new Date(),
    startDate: new Date(),
    maxVotePerPerson: 1,
    pollType: PollType.SINGLE_VOTE,
    mode: EMode.QV,
    options: [
      { value: "", cid: "0x" as `0x${string}`, isUploadedToIPFS: false },
    ],
    keyPair: new Keypair(),
    authType: "none",
    veriMethod: "none",
    pubKey:
      "macipk.a26f6f713fdf9ab73e2bf57662977f8f4539552b3ca0fb2a65654472427f601b",
  });
  const [files, setFiles] = useState<File[] | null>(null);
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setPollData({
      ...pollData,
      options: [
        ...pollData.options,
        { value: "", cid: "0x", isUploadedToIPFS: false },
      ],
    });
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

  const handleOptionChange = (index: number, value: string, file?: File) => {
    const newOptions: {
      value: string;
      cid: `0x${string}`;
      isUploadedToIPFS: boolean;
    }[] = [...pollData.options];
    newOptions[index] = {
      value,
      cid: "0x",
      isUploadedToIPFS: false,
    };
    setPollData({ ...pollData, options: newOptions });

    if (file) {
      setFiles((prev) => {
        const newFiles = prev ? [...prev] : [];
        newFiles[index] = file;
        return [...newFiles];
      });
    }
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
    setFiles((prev) => {
      const newFiles = prev ? [...prev] : [];
      newFiles.splice(index, 1);
      return [...newFiles];
    });
  }

  const duration = Math.round(
    (pollData.expiry.getTime() - pollData.startDate.getTime()) / 1000
  );

  const { writeAsync } = useScaffoldContractWrite({
    contractName:
      pollData.authType === "none" ? "PrivoteFreeForAll" : "PrivoteAnonAadhaar",
    functionName: "createPoll",
    args: [
      pollData.title,
      pollData.options.map((option) => option.value) || [],
      pollData.options.map((option) => option.cid) || [],
      JSON.stringify({ pollType: pollData.pollType }),
      duration > 0 ? BigInt(duration) : 0n,
      pollData.mode,
      PubKey.deserialize(pollData.pubKey).asContractParam() as {
        x: bigint;
        y: bigint;
      },
      pollData.authType || "none",
    ],
    value: parseEther("0.01"),
  });

  async function onSubmit() {
    // validate the inputs
    console.log("creating poll", pollData, duration);
    for (const option of pollData.options) {
      if (!option.value) {
        // TODO: throw error that the option cannot be blank
        notification.error("Option title cannot be blank", {
          showCloseButton: false,
        });
        console.log(option);
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

    console.log("running contract function");
    // save the poll data to ipfs or find another way for saving the poll type on the smart contract.

    try {
      setIsLoading(true);
      let cids = pollData.options.map((option) => option.cid);
      console.log(files);
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          if (!files[i]) {
            cids[i] = "0x";
            continue;
          }
          const file = files[i];
          const data = await uploadFileToLighthouse([file]);
          console.log(data);
          const cid = new CID(data.Hash);
          cids[i] = bytesToHex(cid.bytes);
          pollData.options[i].cid = bytesToHex(cid.bytes);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
      await writeAsync({
        args: [
          pollData.title,
          pollData.options.map((option) => option.value) || [],
          cids || [],
          JSON.stringify({ pollType: pollData.pollType }),
          duration > 0 ? BigInt(duration) : 0n,
          pollData.mode,
          PubKey.deserialize(pollData.pubKey).asContractParam() as {
            x: bigint;
            y: bigint;
          },
          pollData.authType || "none",
        ],
        value: parseEther("0.01"),
      });
      setIsLoading(false);
      refetchPolls();
      onClose();
    } catch (err) {
      setIsLoading(false);
      refetchPolls();
      console.log(err);
    }
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
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Enter the description of the poll"
              value={pollData.description}
              onChange={(e) =>
                setPollData({ ...pollData, description: e.target.value })
              }
            ></textarea>
          </div>
          <div className={styles["input-field-container"]}>
            <label className={styles.label}>Select the start date</label>
            <input
              type="datetime-local"
              className={styles.input}
              placeholder="Enter the title of the poll"
              value={pollData.startDate
                .toLocaleString("sv")
                .replace(" ", "T")
                .slice(0, -3)}
              onChange={(e) =>
                setPollData({
                  ...pollData,
                  startDate: new Date(e.target.value),
                })
              }
            />
          </div>
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
                      options: [
                        {
                          value: "Candidate 1",
                          cid: "0x",
                          isUploadedToIPFS: false,
                        },
                        {
                          value: "Candidate 2",
                          cid: "0x",
                          isUploadedToIPFS: false,
                        },
                        {
                          value: "Candidate 3",
                          cid: "0x",
                          isUploadedToIPFS: false,
                        },
                      ],
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
            {candidateSelection === "withoutImage" &&
              pollData.options.map((option, index) => (
                <div className={styles["candidate-input"]}>
                  <WithoutImageInput
                    key={index}
                    type="text"
                    placeholder={`Candidate ${index + 1}`}
                    value={option.value}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {index !== pollData.options.length - 1 && (
                    <div
                      className={styles["remove-candi"]}
                      onClick={() => removeOptions(index)}
                    >
                      <RxCross2 size={20} />
                    </div>
                  )}
                </div>
              ))}
            {candidateSelection === "withImage" &&
              pollData.options.map((option, index) => (
                <div className={styles["candidate-input"]}>
                  <WithImageInput
                    key={index}
                    index={index}
                    type="text"
                    placeholder={`Candidate ${index + 1}`}
                    value={option.value}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    onFileChange={(e: any) => {
                      console.log(e.target.files[0]);
                      setFiles((prev) => {
                        const newFiles = prev ? [...prev] : [];
                        newFiles[index] = e.target.files[0];
                        return [...newFiles];
                      });
                    }}
                  />
                  {index !== pollData.options.length - 1 && (
                    <div
                      className={styles["remove-candi"]}
                      onClick={() => removeOptions(index)}
                    >
                      <RxCross2 size={20} />
                    </div>
                  )}
                </div>
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
        {isConnected && (
          <Button
            type="button"
            action={onSubmit}
            className={`${styles["submit-btn"]} ${
              isLoading ? styles.loading : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              "Create Poll"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreatePollForm;
