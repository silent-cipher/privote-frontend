import { useState } from "react";
import { IPollData } from "../types";
import { notification } from "~~/utils/scaffold-eth";
import { Keypair, PubKey } from "maci-domainobjs";
import { uploadFileToLighthouse } from "~~/utils/lighthouse";
import CID from "cids";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { parseEther } from "viem";
import { decodeOptionInfo, encodeOptionInfo } from "~~/utils/optionInfo";

const initialPollData: IPollData = {
  title: "",
  description: "",
  expiry: new Date(),
  maxVotePerPerson: 1,
  pollType: null,
  mode: null,
  options: [
    {
      title: "",
      description: "",
      cid: "0x" as `0x${string}`,
      isUploadedToIPFS: false,
    },
  ],
  keyPair: new Keypair(),
  authType: "none",
  veriMethod: "none",
  pubKey: "",
};

export const useCreatePollForm = (
  onClose: () => void,
  refetchPolls: () => void
) => {
  const [pollData, setPollData] = useState<IPollData>(initialPollData);
  const [files, setFiles] = useState<(File | null)[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [candidateSelection, setCandidateSelection] = useState<
    "none" | "withImage" | "withoutImage"
  >("none");
  const [showKeys, setShowKeys] = useState({ show: false, privKey: "" });
  const [pollConfig, setPollConfig] = useState(0);

  const duration = Math.round((pollData.expiry.getTime() - Date.now()) / 1000);

  const { writeAsync } = useScaffoldContractWrite({
    contractName:
      pollData.authType === "none" ? "PrivoteFreeForAll" : "PrivoteAnonAadhaar",
    functionName: "createPoll",
    args: [
      pollData.title,
      pollData.options.map((option) => option.title) || [],
      pollData.options.map((option) => option.cid) || [],
      JSON.stringify({ pollType: pollData.pollType }),
      duration > 0 ? BigInt(duration) : 0n,
      pollData.mode,
      PubKey.isValidSerializedPubKey(pollData.pubKey)
        ? (PubKey.deserialize(pollData.pubKey).asContractParam() as {
            x: bigint;
            y: bigint;
          })
        : { x: 0n, y: 0n },
      pollData.authType || "none",
    ],
    value: parseEther("0.01"),
  });

  const generateKeyPair = () => {
    const keyPair = new Keypair();

    setPollData((prev) => ({
      ...prev,
      pubKey: keyPair.toJSON().pubKey,
    }));
    setShowKeys({ show: true, privKey: keyPair.toJSON().privKey });
  };

  const validateForm = (): boolean => {
    if (!pollData.title.trim()) {
      notification.error("Please enter a title");
      return false;
    }

    if (!pollData.description.trim()) {
      notification.error("Please enter a description");
      return false;
    }

    if (pollData.pollType === null) {
      notification.error("Please select a poll type");
      return false;
    }

    if (pollData.mode === null) {
      notification.error("Please select a voting mode");
      return false;
    }

    if (pollData.options.filter((opt) => !opt.title?.trim()).length > 0) {
      notification.error("Please add at least 1 option");
      return false;
    }

    if (!PubKey.isValidSerializedPubKey(pollData.pubKey)) {
      notification.error("Please enter a valid public key");
      return false;
    }

    return true;
  };

  const handleOptionChange = (index: number, value: string, field: string) => {
    setPollData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const handleFileChange = (index: number, file: File) => {
    setFiles((prev) => {
      const newFiles = prev ? [...prev] : [];
      newFiles[index] = file;
      return newFiles;
    });
  };

  const handleFileRemove = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev ? [...prev] : [];
      newFiles[index] = null;
      return newFiles;
    });
  };

  const handleVeriMethodChange = (e: React.ChangeEvent<any>) => {
    setPollData({ ...pollData, authType: e.target.value });
  };

  const handleAddOption = () => {
    setPollData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { value: "", cid: "0x" as `0x${string}`, isUploadedToIPFS: false },
      ],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setPollData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
    setFiles((prev) => {
      if (!prev) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const cids: `0x${string}`[] = [];

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) {
            cids[i] = "0x";
            continue;
          }
          const data = await uploadFileToLighthouse([file]);
          const cid = new CID(data.Hash);
          cids[i] = `0x${Buffer.from(cid.bytes).toString("hex")}`;
        }
      }

      // Update options with CIDs
      const updatedOptions = pollData.options.map((opt, index) => ({
        ...opt,
        cid: cids[index] || "0x",
        isUploadedToIPFS: !!cids[index],
      }));

      const finalPollData = {
        ...pollData,
        options: updatedOptions,
      };

      const encodedOptions = await Promise.all(
        finalPollData.options.map(async (option) => {
          // Always include description, but only include CID if file is uploaded
          return encodeOptionInfo({
            cid: option.isUploadedToIPFS ? option.cid : ("0x" as `0x${string}`),
            description: option.description,
          });
        })
      );

      await writeAsync({
        args: [
          finalPollData.title,
          finalPollData.options.map((option) => option.title) || [],
          encodedOptions || [],
          JSON.stringify({
            pollType: finalPollData.pollType,
            maxVotePerPerson: finalPollData.maxVotePerPerson,
            description: finalPollData.description,
          }),
          duration > 0 ? BigInt(duration) : 0n,
          finalPollData.mode,
          PubKey.deserialize(finalPollData.pubKey).asContractParam() as {
            x: bigint;
            y: bigint;
          },
          finalPollData.authType || "none",
        ],
        value: parseEther("0.01"),
      });

      setIsLoading(false);
      onClose();
      refetchPolls();
      notification.success("Poll created successfully!");
    } catch (error) {
      console.error("Error creating poll:", error);
      notification.error("Failed to create poll");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pollData,
    setPollData,
    files,
    isLoading,
    showKeys,
    setShowKeys,
    pollConfig,
    setPollConfig,
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
  };
};
