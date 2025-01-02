import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldContractWrite } from "./scaffold-eth";
import { EMode } from "~~/types/poll";
import deployedContracts from "~~/contracts/deployedContracts";
import { useChainId } from "wagmi";

interface PublishForm {
  cid: string;
  privKey: string;
}

const BACKEND_URL = `${process.env.NEXT_PUBLIC_TALLY_BACKEND_URL}/api/generate-proof`;

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
    try {
      setBtnText("Publishing...");
      const contracts =
        deployedContracts[chainId as keyof typeof deployedContracts];
      const contract =
        authType === "none"
          ? contracts["PrivoteFreeForAll"]
          : contracts["PrivoteAnonAadhaar"];
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: JSON.stringify({
          pollId: pollId,
          coordinatorPrivKey: form.privKey,
          maciAddress: contract.address,
          useQuadraticVoting: mode === EMode.NON_QV ? false : true,
          startBlock: contract.deploymentBlockNumber,
          chainId: chainId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        console.log("Tally CID", data.data);
        await writeAsync({
          args: [BigInt(pollId), data.data],
        });
        router.push("/admin");
      }

      setBtnText("Publish Results");
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
