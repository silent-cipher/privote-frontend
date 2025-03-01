export enum PollStatus {
  NOT_STARTED = "Not Started",
  OPEN = "Open",
  CLOSED = "Closed",
  RESULT_COMPUTED = "Result Computed",
}

export interface RawPoll {
  id: bigint;
  name: string;
  encodedOptions: `0x${string}`;
  metadata: string;
  pollContracts: {
    poll: string;
    messageProcessor: string;
    tally: string;
  };
  startTime: bigint;
  endTime: bigint;
  numOfOptions: bigint;
  options: readonly string[];
  optionInfo: readonly string[];
  isTallied: boolean;
  pollDeployer: string;
  authType: string;
  isQv: EMode;
}

export interface Poll extends RawPoll {
  status: PollStatus;
}

export enum PollType {
  NOT_SELECTED,
  SINGLE_VOTE,
  MULTIPLE_VOTE,
  WEIGHTED_MULTIPLE_VOTE,
}

export enum AuthType {
  FREE = "free",
  ANON = "anon",
}

export enum VerificationType {
  NONE,
  ANON,
  WC,
  NFC,
}

/**
 * Supported verification key modes
 */
export enum EMode {
  QV,
  NON_QV,
}
