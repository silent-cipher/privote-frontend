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
  options: PollOption[];
  keyPair: Keypair;
  authType: "free" | "anon";
  veriMethod: string;
  pubKey: string;
}

export interface PollOption {
  title?: string;
  description?: string;
  link?: string;
  cid: `0x${string}`;
  isUploadedToIPFS: boolean;
}

export interface VerificationProps {
  handleVeriMethodChange: (e: React.MouseEvent<HTMLButtonElement>) => void;
  authType: "free" | "anon";
}

export interface CandidateSelectionProps {
  candidateSelection: "none" | "withImage" | "withoutImage";
  setCandidateSelection: (value: "none" | "withImage" | "withoutImage") => void;
  handleAddOption: () => void;
  handleOptionChange: (
    index: number,
    value: string,
    field: "value" | "title" | "description"
  ) => void;
  options: PollOption[];
  files: (File | null)[] | null;
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
  option: PollOption;
  index: number;
  file?: File | null;
  onOptionChange: (
    index: number,
    value: string,
    field: "value" | "title" | "description" | "link"
  ) => void;
  onFileChange: (index: number, file: File) => void;
  onFileRemove: (index: number) => void;
  onRemoveOption: (index: number) => void;
  candidateSelection: "none" | "withImage" | "withoutImage";
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
