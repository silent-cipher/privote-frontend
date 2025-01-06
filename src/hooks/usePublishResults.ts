import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldContractWrite } from "./scaffold-eth";
import { EMode } from "~~/types/poll";
import deployedContracts from "~~/contracts/deployedContracts";
import { useChainId, useAccount } from "wagmi";
import { socketManager } from "~~/services/socket/socketManager";

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
    if (!form.privKey || !address) {
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
        },
        {
          onComplete: async (data) => {
            try {
              await writeAsync({
                args: [BigInt(pollId), data.data.cid],
              });
              setBtnText("Publish Results");
            } catch (error) {
              console.error("Error updating contract:", error);
              setBtnText("Publish Results");
            }
          },
          onError: (error) => {
            console.error("Proof generation error:", error);
            setBtnText("Publish Results");
          },
          onRejected: (data) => {
            console.log("Proof generation rejected:", data);
            setBtnText("Publish Results");
          },
        }
      );
    } catch (error) {
      setBtnText("Publish Results");
      console.error("Error publishing results:", error);
    }
  };

  const publishWithDocker = async () => {
    try {
      await writeAsync({
        args: [BigInt(pollId), form.cid],
      });
      router.push("/");
    } catch (error) {
      console.error("Error publishing results:", error);
    }
  };

  return {
    form,
    btnText,
    dockerConfig,
    setDockerConfig,
    handleFormChange,
    publishWithBackend,
    publishWithDocker,
  };
};

export default usePublishResults;
