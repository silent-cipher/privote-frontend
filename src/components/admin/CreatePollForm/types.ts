import { Keypair } from "maci-domainobjs";
import { PollType } from "~~/types/poll";
import { EMode } from "~~/types/poll";

export interface CreatePollFormProps {
  onClose: () => void;
  refetchPolls: () => void;
}

export interface IPollData {
  title: string;
  description: string;
  expiry: Date;
  maxVotePerPerson: number;
  pollType: PollType | null;
  mode: EMode | null;
  options: {
    value: string;
    cid: `0x${string}`;
    isUploadedToIPFS: boolean;
  }[];
  keyPair: Keypair;
  authType: "none" | "anon";
  veriMethod: string;
  pubKey: string;
}

export interface VerificationProps {
  handleVeriMethodChange: (e: React.MouseEvent<HTMLButtonElement>) => void;
  authType: "none" | "anon";
}

export interface CandidateSelectionProps {
  candidateSelection: "withImage" | "withoutImage" | "none";
  setCandidateSelection: React.Dispatch<
    React.SetStateAction<"none" | "withImage" | "withoutImage">
  >;
  options: {
    value: string;
    cid: `0x${string}`;
    isUploadedToIPFS: boolean;
  }[];
  files: (File | null)[] | null;
  handleOptionChange: (index: number, value: string) => void;
  handleAddOption: React.MouseEventHandler<HTMLButtonElement>;
  onFileChange: (index: number, file: File) => void;
  onFileRemove: (index: number) => void;
  onRemoveOption: (index: number) => void;
}

export interface PollConfigurationProps {
  pollConfig: number;
  setPollConfig: React.Dispatch<React.SetStateAction<number>>;
  generateKeyPair: () => void;
  showKeys: { show: boolean; privKey: string };
  pubKey: string;
  handlePubKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface PollOptionProps {
  candidateSelection: "withImage" | "withoutImage" | "none";
  option: { value: string; cid: string; isUploadedToIPFS: boolean };
  index: number;
  file: File | null;
  onOptionChange: (index: number, value: string) => void;
  onFileChange: (index: number, file: File) => void;
  onFileRemove: (index: number) => void;
  onRemoveOption: (index: number) => void;
}

export interface PollSettingsProps {
  pollData: IPollData;
  onPollTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMaxVoteChange: (
    e: React.ChangeEvent<HTMLInputElement> | number,
    action?: "add" | "remove"
  ) => void;
}
