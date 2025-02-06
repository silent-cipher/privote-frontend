import styles from "~~/styles/publish.module.css";
import WithoutImageInput from "~~/components/admin/CreatePollForm/components/WithoutImageInput";
import { AuthType, PollType, RawPoll } from "~~/types/poll";
import deployedContracts from "~~/contracts/deployedContracts";
import { useAccount, useChainId } from "wagmi";
import { useNetwork } from "wagmi";
import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { ProofGenerationStatus } from "~~/services/socket/types/response";
import { getMaciContractName } from "~~/utils/maciName";

const btnTextMap = {
  [ProofGenerationStatus.IDLE]: "Publish Result",
  [ProofGenerationStatus.ACCEPTED]: "Starting Proof Generation...",
  [ProofGenerationStatus.MERGINGMESSAGES]: "Merging Messages...",
  [ProofGenerationStatus.MERGINGSIGNUPS]: "Merging Signups...",
  [ProofGenerationStatus.GENERATINGPROOF]: "Generating Proof...",
  [ProofGenerationStatus.SUBMITTINGONCHAIN]: "Submitting onchain...",
  [ProofGenerationStatus.SUCCESS]: "Result Published",
  [ProofGenerationStatus.ERROR]: "Publish Result",
  [ProofGenerationStatus.REJECTED]: "Publish Result",
};

interface DockerConfigProps {
  poll: RawPoll | undefined;
  pollType: PollType;
  authType: AuthType;
  proofGenerationState: ProofGenerationStatus;
  isSelected: boolean;
  onClick: () => void;
  cidValue: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
  pollId: string;
}

const CommandBlock = ({ command }: { command: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.commandBlock}>
      <pre className={styles.commandText}>{command}</pre>
      <button
        className={styles.copyButton}
        onClick={copyToClipboard}
        title={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? <FiCheck /> : <FiCopy />}
      </button>
    </div>
  );
};

const getPollText = (pollType: PollType) => {
  switch (pollType) {
    case PollType.SINGLE_VOTE:
      return "single";
    case PollType.MULTIPLE_VOTE:
      return "multi";
    case PollType.WEIGHTED_MULTIPLE_VOTE:
      return "multi";
    default:
      return "single";
  }
};

export const DockerConfig = ({
  poll,
  pollId,
  pollType,
  authType,
  proofGenerationState,
  isSelected,
  onClick,
  cidValue,
  onFormChange,
  onPublish,
}: DockerConfigProps) => {
  const chainId = useChainId();
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const contracts =
    deployedContracts[chainId as keyof typeof deployedContracts];
  const contractName = getMaciContractName(authType, pollType);
  const contract = contracts[contractName];
  return (
    <div className={styles["config-wrapper"]}>
      <div className={styles["config-option"]} onClick={onClick}>
        <div
          className={`${styles.dot} ${isSelected ? styles.selected : ""}`}
        ></div>
        <div className={styles["gen-container"]}>
          <p className={styles["config-heading"]}>Generate results Locally</p>
          {isSelected && (
            <>
              <div className={styles.instructionsContainer}>
                <div className={styles.stepBlock}>
                  <h3 className={styles.stepTitle}>Step 1: Clone and Setup</h3>
                  <CommandBlock command="git clone https://github.com/PriVote-Project/privote-contracts.git" />
                  <CommandBlock command="cd privote-contracts" />
                  <CommandBlock command="yarn install" />
                  <CommandBlock command="yarn download-zkeys" />
                </div>

                <div className={styles.stepBlock}>
                  <h3 className={styles.stepTitle}>Step 2: Generate Results</h3>
                  <p className={styles.stepDescription}>
                    Replace <code>&lt;private-key&gt;</code> with your
                    coordinator's private key generated while creating the poll.
                  </p>
                  <CommandBlock
                    command={`yarn hardhat genResults --poll ${pollId} --auth-type ${
                      poll?.authType
                    } --poll-type ${getPollText(
                      pollType
                    )} --use-quadratic-voting ${
                      poll?.isQv === 0 ? "true" : "false"
                    } --output-dir ./proofs --tally-file ./tally.json --start-block ${
                      contract.deploymentBlockNumber
                    } --network ${
                      isConnected ? chain?.name?.toLowerCase() : "holesky"
                    } --coordinator-private-key <private-key>`}
                  />
                </div>
                <div className={styles.stepBlock}>
                  <h3 className={styles.stepTitle}>Step 3: Submit onchain</h3>
                  <CommandBlock
                    command={`yarn hardhat submitOnChain --poll ${pollId} --auth-type ${
                      poll?.authType
                    } --output-dir ./proofs --tally-file ./tally.json --network ${
                      isConnected ? chain?.name?.toLowerCase() : "holesky"
                    }`}
                  />
                </div>

                {/* <div className={styles.stepBlock}>
                  <h3 className={styles.stepTitle}>Step 3: Publish Results</h3>
                  <p className={styles.stepDescription}>
                    After generating the results, you'll get a CID. Enter it
                    below to publish the results.
                  </p>
                  <WithoutImageInput
                    placeholder="Enter tally file CID..."
                    value={cidValue}
                    onChange={onFormChange}
                    name="cid"
                    className={styles["public-input"]}
                  />
                </div> */}
              </div>
              {/* <button
                className={styles["publish-btn"]}
                disabled={
                  !cidValue ||
                  (proofGenerationState !== ProofGenerationStatus.IDLE &&
                    proofGenerationState !== ProofGenerationStatus.REJECTED &&
                    proofGenerationState !== ProofGenerationStatus.ERROR)
                }
                onClick={onPublish}
              >
                {btnTextMap[proofGenerationState]}
              </button> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DockerConfig;
