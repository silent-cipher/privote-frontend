export interface RateLimitInfo {
  remaining: number;
  resetIn: number; // seconds until reset
}

export interface BaseSocketResponse {
  success: boolean;
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

export interface ProofCompleteResponse extends BaseSocketResponse {
  data: {
    cid: string;
    cached: boolean;
  };
}

export interface ProofErrorResponse extends BaseSocketResponse {
  error: string;
  details?: any;
}
