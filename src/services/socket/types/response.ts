export interface RateLimitInfo {
  remaining: number;
  resetIn: number; // seconds until reset
}

export enum ProofGenerationStatus {
  IDLE,
  ACCEPTED,
  MERGINGMESSAGES,
  MERGINGSIGNUPS,
  GENERATINGPROOF,
  UPLOADINGTOIPFS,
  SUCCESS,
  PUBLISHED,
  REJECTED,
  ERROR,
}

export interface BaseSocketResponse {
  success: boolean;
  status: ProofGenerationStatus;
  jobId?: string;
  message: string;
  timestamp: number;
}

export interface ProofRequestAcceptedResponse extends BaseSocketResponse {
  rateLimitInfo: RateLimitInfo;
}

export interface ProofRequestRejectedResponse extends BaseSocketResponse {
  rateLimitInfo?: RateLimitInfo;
  error: string;
}

export interface ProofGenerationResponse extends BaseSocketResponse {
  data: {
    cid: string;
    cached: boolean;
  };
}

export interface ProofErrorResponse extends BaseSocketResponse {
  error: string;
  details?: any;
}
