import { useAccount } from "wagmi";
import Image from "next/image";
import styles from "./index.module.css";
import { CreatePollFormProps } from "./types";
import { PollSettings } from "./components/PollSettings";
import { useCreatePollForm } from "./hooks/useCreatePollForm";
import { LuPlus } from "react-icons/lu";
import {
  Divider,
  CandidateSelection,
  Verification,
  PollConfiguration,
} from "./components";
import Button from "~~/components/ui/Button";

const CreatePollForm = ({ onClose, refetchPolls }: CreatePollFormProps) => {
  const { isConnected } = useAccount();
  const {
    pollData,
    setPollData,
    files,
    isLoading,
    showKeys,
    setPollConfig,
    pollConfig,
    setShowKeys,
    generateKeyPair,
    candidateSelection,
    setCandidateSelection,
    handleOptionChange,
    handleFileChange,
    handleFileRemove,
    handleAddOption,
    handleRemoveOption,
    handleSubmit,
    handleVeriMethodChange,
  } = useCreatePollForm(onClose, refetchPolls);

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <h1>Please connect your wallet</h1>
      </div>
    );
  }

  return (
    <div className={styles["create-form"]}>
      <button className={styles.back} onClick={onClose}>
        <Image src="/arrow-left.svg" alt="arrow left" width={27} height={27} />
      </button>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.heading}>Create a Poll</h1>
        <div className={styles["input-field-container"]}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            value={pollData.title}
            onChange={(e) =>
              setPollData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter poll title"
          />
        </div>

        <div className={styles["input-field-container"]}>
          <label className={styles.label}>Description</label>
          <textarea
            value={pollData.description}
            onChange={(e) =>
              setPollData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Enter poll description"
          />
        </div>

        <div className={styles["input-field-container"]}>
          <label className={styles.label}>End Date</label>
          <input
            type="datetime-local"
            value={pollData.expiry.toISOString().slice(0, 16)}
            onChange={(e) =>
              setPollData((prev) => ({
                ...prev,
                expiry: new Date(e.target.value),
              }))
            }
          />
        </div>

        <PollSettings
          pollData={pollData}
          onPollTypeChange={(e) =>
            setPollData((prev) => ({
              ...prev,
              pollType: e.target.value as any,
            }))
          }
          onModeChange={(e) =>
            setPollData((prev) => ({ ...prev, mode: e.target.value as any }))
          }
          onMaxVoteChange={(e, action?: "add" | "remove") => {
            if (action === "add") {
              setPollData((prev) => ({
                ...prev,
                maxVotePerPerson: prev.maxVotePerPerson + 1,
              }));
            } else if (action === "remove") {
              setPollData((prev) => ({
                ...prev,
                maxVotePerPerson: prev.maxVotePerPerson - 1,
              }));
            } else {
              setPollData((prev) => ({
                ...prev,
                maxVotePerPerson: parseInt(e.target.value),
              }));
            }
          }}
        />

        <Divider />

        <Verification
          handleVeriMethodChange={handleVeriMethodChange}
          authType={pollData.authType}
        />

        <Divider />

        <CandidateSelection
          options={pollData.options}
          files={files}
          handleOptionChange={handleOptionChange}
          handleAddOption={handleAddOption}
          onFileChange={handleFileChange}
          onFileRemove={handleFileRemove}
          onRemoveOption={handleRemoveOption}
          candidateSelection={candidateSelection}
          setCandidateSelection={setCandidateSelection}
        />

        <PollConfiguration
          setPollConfig={setPollConfig}
          pollConfig={pollConfig}
          pubKey={pollData.pubKey}
          handlePubKeyChange={(e) =>
            setPollData((prev) => ({ ...prev, pubKey: e.target.value }))
          }
          generateKeyPair={generateKeyPair}
          showKeys={showKeys}
        />

        <div className={styles["actions"]}>
          <button
            type="button"
            className={styles["cancel-btn"]}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <Button
            type="submit"
            action={() => {}}
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
        </div>
      </form>
    </div>
  );
};

export default CreatePollForm;
