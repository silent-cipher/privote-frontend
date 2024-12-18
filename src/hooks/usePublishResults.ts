import { useState } from "react";
import { useRouter } from "next/navigation";
import { useScaffoldContractWrite } from "./scaffold-eth";

interface PublishForm {
  cid: string;
  privKey: string;
}

const BACKEND_URL = "http://localhost:8080/generate-tally";

export const usePublishResults = (pollId: string) => {
  const [form, setForm] = useState<PublishForm>({
    cid: "",
    privKey: "",
  });
  const [btnText, setBtnText] = useState("Publish Results");
  const [dockerConfig, setDockerConfig] = useState(0);
  const router = useRouter();

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "Privote",
    functionName: "updatePollTallyCID",
    args: [undefined, undefined],
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const publishWithBackend = async () => {
    try {
      setBtnText("Publishing...");
      const response = await fetch(BACKEND_URL, {
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

      if (response.ok) {
        await writeAsync({
          args: [BigInt(pollId), data.cid],
        });
      }

      setBtnText("Publish Results");
      router.push("/");
    } catch (error) {
      setBtnText("Publish Results");
      router.push("/");
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
