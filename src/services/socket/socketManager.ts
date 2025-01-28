import { io, Socket } from "socket.io-client";
import {
  ProofRequestAcceptedResponse,
  ProofRequestRejectedResponse,
  ProofGenerationResponse,
  ProofErrorResponse,
  ProofGenerationStatus,
} from "./types/response";

type ProofCallback = (data: ProofGenerationResponse) => Promise<any>;

interface ProofGenerationRequest {
  pollId: string;
  coordinatorPrivKey: string;
  maciAddress: string;
  useQuadraticVoting: boolean;
  startBlock: number;
  chainId: number;
  userId: string;
  useWasm: boolean;
  quiet?: boolean;
}

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private proofCallbacks: Map<string, ProofCallback> = new Map();
  private latestCallback: ProofCallback | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        reconnection: true,
        reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
      });

      this.setupSocketListeners();
    }
    return this.socket;
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected!");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("Connection lost!");
    });

    this.socket.on("generatingProof", async (data: ProofGenerationResponse) => {
      console.log("Generating proof", data);
      if (data.jobId) {
        // Non-cached result - use jobId to get callback
        const callback = this.proofCallbacks.get(data.jobId);
        if (callback) {
          await callback(data);
          if (
            data.status === ProofGenerationStatus.SUCCESS ||
            data.status === ProofGenerationStatus.REJECTED ||
            data.status === ProofGenerationStatus.ERROR
          )
            this.proofCallbacks.delete(data.jobId);
        } else if (this.latestCallback) {
          // Cached result - use latest callback since there's no jobId
          this.latestCallback(data);
          this.latestCallback = null;
        }
      } else {
        // Cached result - use latest callback since there's no jobId
        if (this.latestCallback) {
          this.latestCallback(data);
          this.latestCallback = null;
        }
      }
    });

    this.socket.on("connect_error", () => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        this.cleanup();
      }
    });
  }

  public generateProof(
    proofData: ProofGenerationRequest,
    callback: ProofCallback
  ) {
    const socket = this.getSocket();

    // Store the callback for potential cached result
    this.latestCallback = callback;

    socket.emit("generateProof", proofData);

    socket.once("proofRequestAccepted", (response: ProofGenerationResponse) => {
      console.log("Proof request accepted", response);
      if (response.jobId) {
        // Move callback from latest to proofCallbacks map
        if (this.latestCallback) {
          this.proofCallbacks.set(response.jobId, this.latestCallback);
          this.latestCallback = null;
          callback(response);
        }
      }
    });

    socket.once("proofRequestRejected", (response: ProofGenerationResponse) => {
      console.log("Proof request rejected", response);
      // Clear the latest callback since the request was rejected
      if (this.latestCallback) {
        this.latestCallback(response);
        this.latestCallback = null;
      }
    });

    socket.once("errorGeneratingProof", (response: ProofGenerationResponse) => {
      console.log("Error generating proof", response);
      // Clear the latest callback since the request was rejected
      if (this.latestCallback) {
        this.latestCallback(response);
        this.latestCallback = null;
      }
    });
  }

  public cleanup() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.proofCallbacks.clear();
    this.latestCallback = null;
  }
}

export const socketManager = SocketManager.getInstance();
