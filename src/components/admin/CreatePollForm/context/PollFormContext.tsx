import { createContext, useContext, useState, ReactNode } from "react";
import { IPollData } from "../types";
import { notification } from "~~/utils/scaffold-eth";
import { Keypair, PubKey } from "maci-domainobjs";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { parseEther } from "viem";
import { getMaciContractName } from "~~/utils/maciName";
import { encodeOptionInfo } from "~~/utils/optionInfo";
import { uploadFileToLighthouse } from "~~/utils/lighthouse";
import CID from "cids";
import { AuthType, PollType } from "~~/types/poll";
import { useRouter } from "next/navigation";
import { useBalanceCheck } from "~~/hooks/useBalanceCheck";

const initialPollData: IPollData = {
  title: "",
  description: "",
  expiry: new Date(Date.now() + 60 * 60 * 1000),
  maxVotePerPerson: 1,
  pollType: PollType.NOT_SELECTED,
  mode: null,
  options: [
    {
      title: "",
      description: "",
      cid: "0x" as `0x${string}`,
      link: "",
      isUploadedToIPFS: false,
    },
    {
      title: "",
      description: "",
      cid: "0x" as `0x${string}`,
      link: "",
      isUploadedToIPFS: false,
    },
  ],
  keyPair: new Keypair(),
  authType: AuthType.FREE,
  veriMethod: "none",
  pubKey: "",
};

interface PollFormContextType {
  pollData: IPollData;
  setPollData: React.Dispatch<React.SetStateAction<IPollData>>;
  files: (File | null)[] | null;
  isLoading: boolean;
  showKeys: { show: boolean; privKey: string };
  setShowKeys: React.Dispatch<
    React.SetStateAction<{ show: boolean; privKey: string }>
  >;
  pollConfig: number;
  setPollConfig: React.Dispatch<React.SetStateAction<number>>;
  generateKeyPair: () => void;
  candidateSelection: "none" | "withImage" | "withoutImage";
  setCandidateSelection: React.Dispatch<
    React.SetStateAction<"none" | "withImage" | "withoutImage">
  >;
  handleOptionChange: (
    index: number,
    value: string,
    field: "value" | "title" | "description" | "link"
  ) => void;
  handleFileChange: (index: number, file: File) => void;
  handleFileRemove: (index: number) => void;
  handleAddOption: () => void;
  handleRemoveOption: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleVeriMethodChange: (e: React.ChangeEvent<any>) => void;
  showFaucetModal: boolean;
  onCloseFaucetModal: () => void;
}

const PollFormContext = createContext<PollFormContextType | undefined>(
  undefined
);

export const PollFormProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [pollData, setPollData] = useState<IPollData>(initialPollData);
  const [files, setFiles] = useState<(File | null)[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [candidateSelection, setCandidateSelection] = useState<
    "none" | "withImage" | "withoutImage"
  >("none");
  const [showKeys, setShowKeys] = useState({ show: false, privKey: "" });
  const [pollConfig, setPollConfig] = useState(0);
  const { showFaucetModal, onCloseFaucetModal, checkBalance } =
    useBalanceCheck();

  const duration = Math.round((pollData.expiry.getTime() - Date.now()) / 1000);

  const { writeAsync } = useScaffoldContractWrite({
    contractName: getMaciContractName(pollData.authType, pollData.pollType),
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
      pollData.authType || "free",
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

    // Removed description validation
    // if (!pollData.description.trim()) {
    //   notification.error("Please enter a description");
    //   return false;
    // }

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

    // If link is present on option then it should be a valid url
    const validUrlReges = new RegExp(
      "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)"
    );

    for (const option of pollData.options) {
      if (option.link && !validUrlReges.test(option.link)) {
        notification.error(
          "Please enter a valid URL for Candidate : " + option.title
        );
        return false;
      }
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

    if (checkBalance()) return;

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
            link: option.link,
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
          finalPollData.authType || "free",
        ],
        value: parseEther("0.01"),
      });

      setIsLoading(false);
      notification.success("Poll created successfully!");
      router.push("/polls");
    } catch (error) {
      console.error("Error creating poll:", error);
      notification.error("Failed to create poll");
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
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
    showFaucetModal,
    onCloseFaucetModal,
  };

  return (
    <PollFormContext.Provider value={value}>
      {children}
    </PollFormContext.Provider>
  );
};

export const usePollForm = () => {
  const context = useContext(PollFormContext);
  if (context === undefined) {
    throw new Error("usePollForm must be used within a PollFormProvider");
  }
  return context;
};
