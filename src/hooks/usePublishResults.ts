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
      authType === "none" ? "PrivoteFreeForAll" : "PrivoteAnonAadhaar",
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

      const contracts =
        deployedContracts[chainId as keyof typeof deployedContracts];
      const contract =
        authType === "none"
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
          quiet: true,
          useWasm: true,
        },
        async (data) => {
          console.log(data);
          try {
            if (data.status !== ProofGenerationStatus.SUCCESS) {
              setProofGenerationState(data.status);
              if (
                data.status === ProofGenerationStatus.REJECTED ||
                data.status === ProofGenerationStatus.ERROR
              ) {
                notification.error("Proof generation failed!");
              }
              return;
            }
            setProofGenerationState(data.status);
            await writeAsync({
              args: [BigInt(pollId), data.data.cid],
            });
            setProofGenerationState(ProofGenerationStatus.PUBLISHED);
            router.push("/admin");
            setBtnText("Publish Results");
          } catch (error) {
            console.error("Error updating contract:", error);
            setBtnText("Publish Results");
            setProofGenerationState(ProofGenerationStatus.ERROR);
          }
        }
      );
    } catch (error) {
      setProofGenerationState(ProofGenerationStatus.ERROR);
      setBtnText("Publish Results");
      console.error("Error publishing results:", error);
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
