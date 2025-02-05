import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldContractWrite } from "./scaffold-eth";
import { EMode } from "~~/types/poll";
import deployedContracts from "~~/contracts/deployedContracts";
import { useChainId, useAccount } from "wagmi";
import { socketManager } from "~~/services/socket/socketManager";
import { ProofGenerationStatus } from "~~/services/socket/types/response";
import { notification } from "~~/utils/scaffold-eth";
import { PrivKey } from "maci-domainobjs";

interface PublishForm {
  cid: string;
  privKey: string;
}

export const usePublishResults = (
  pollId: string,
  authType: string,
  mode: EMode
) => {
  const [form, setForm] = useState<PublishForm>({
    cid: "",
    privKey: "",
  });
  const [btnText, setBtnText] = useState("Publish Results");
  const [dockerConfig, setDockerConfig] = useState(0);
  const [proofGenerationState, setProofGenerationState] =
    useState<ProofGenerationStatus>(ProofGenerationStatus.IDLE);
  const router = useRouter();
  const chainId = useChainId();
  const { address } = useAccount();

  const { writeAsync } = useScaffoldContractWrite({
    contractName:
      authType === "free" ? "PrivoteFreeForAll" : "PrivoteAnonAadhaar",
    functionName: "updatePollTallyCID",
    args: [undefined, undefined],
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const publishWithBackend = async () => {
    if (!PrivKey.isValidSerializedPrivKey(form.privKey)) {
      notification.error("Invalid private key");
      return;
    }

    if (!address) {
      notification.error("Please connect your wallet");
      return;
    }

    try {
      setBtnText("Publishing...");
      setProofGenerationState(ProofGenerationStatus.ACCEPTED);

      const contracts =
        deployedContracts[chainId as keyof typeof deployedContracts];
      const contract =
        authType === "free"
          ? contracts["PrivoteFreeForAll"]
          : contracts["PrivoteAnonAadhaar"];

      socketManager.generateProof(
        {
          pollId: pollId,
          coordinatorPrivKey: form.privKey,
          maciAddress: contract.address,
          useQuadraticVoting: mode === EMode.NON_QV ? false : true,
          startBlock: contract.deploymentBlockNumber,
          chainId: chainId,
          userId: address,
          quiet: false,
          useWasm: true,
        },
        async (data) => {
          try {
            if (data.status !== ProofGenerationStatus.SUCCESS) {
              setProofGenerationState(data.status);
              if (
                data.status === ProofGenerationStatus.REJECTED ||
                data.status === ProofGenerationStatus.ERROR
              ) {
                // Show the specific error message from the server if available
                notification.error(
                  data.message || "Failed to generate proof. Please try again."
                );
                setBtnText("Publish Results");
              }
              return;
            }

            setProofGenerationState(data.status);

            try {
              await writeAsync({
                args: [BigInt(pollId), data?.data?.cid],
              });
              setProofGenerationState(ProofGenerationStatus.PUBLISHED);
              router.push("/admin");
            } catch (error) {
              console.error("Error updating contract:", error);
              notification.error(
                "Failed to update contract. Please try again."
              );
              setProofGenerationState(ProofGenerationStatus.ERROR);
            }

            setBtnText("Publish Results");
          } catch (error) {
            console.error("Error in proof generation callback:", error);
            setBtnText("Publish Results");
            setProofGenerationState(ProofGenerationStatus.ERROR);
            notification.error(
              "An unexpected error occurred. Please try again."
            );
          }
        }
      );
    } catch (error) {
      setProofGenerationState(ProofGenerationStatus.ERROR);
      setBtnText("Publish Results");
      console.error("Error publishing results:", error);
      notification.error(
        "Failed to start publishing process. Please try again."
      );
    }
  };

  const publishWithDocker = async () => {
    try {
      if (!address) {
        notification.error("Please connect your wallet");
        return;
      }
      console.log(form.cid);
      setProofGenerationState(ProofGenerationStatus.SUCCESS);
      await writeAsync({
        args: [BigInt(pollId), form.cid],
      });
      setProofGenerationState(ProofGenerationStatus.PUBLISHED);
      router.push(`/polls/${pollId}?authType=${authType}`);
    } catch (error) {
      setProofGenerationState(ProofGenerationStatus.ERROR);
      console.error("Error publishing results:", error);
      notification.error("Error publishing results!");
    }
  };

  return {
    form,
    btnText,
    proofGenerationState,
    dockerConfig,
    setDockerConfig,
    handleFormChange,
    publishWithBackend,
    publishWithDocker,
  };
};

export default usePublishResults;
