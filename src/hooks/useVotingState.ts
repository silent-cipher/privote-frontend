import { PollStatus } from "~~/types/poll";
import { AnonAadhaarProof } from "@anon-aadhaar/react";

interface VotingStateProps {
  authType: string;
  pollStatus: PollStatus | undefined;
  isConnected: boolean;
  isUserRegistered: boolean;
  anonAadhaarStatus: string;
  isVotesInvalid: boolean;
}

interface VotingState {
  canVote: boolean;
  message: string | null;
  showRegisterButton: boolean;
  showVoteButton: boolean;
  showLoginButton: boolean;
  showConnectWallet: boolean;
}

export const useVotingState = ({
  authType,
  pollStatus,
  isConnected,
  isUserRegistered,
  anonAadhaarStatus,
  isVotesInvalid,
}: VotingStateProps): VotingState => {
  if (!pollStatus) {
    return {
      canVote: false,
      message: "Loading poll status...",
      showRegisterButton: false,
      showVoteButton: false,
      showLoginButton: false,
      showConnectWallet: false,
    };
  }

  if (pollStatus === PollStatus.NOT_STARTED) {
    return {
      canVote: false,
      message: "Voting has not started yet",
      showRegisterButton: false,
      showVoteButton: false,
      showLoginButton: false,
      showConnectWallet: false,
    };
  }

  if (pollStatus === PollStatus.CLOSED) {
    return {
      canVote: false,
      message: "Voting has ended",
      showRegisterButton: false,
      showVoteButton: false,
      showLoginButton: false,
      showConnectWallet: false,
    };
  }

  if (!isConnected) {
    return {
      canVote: false,
      message: "Please connect your wallet to vote",
      showRegisterButton: false,
      showVoteButton: false,
      showLoginButton: false,
      showConnectWallet: true,
    };
  }

  if (authType === "none") {
    if (!isUserRegistered) {
      return {
        canVote: false,
        message: "Please register to vote",
        showRegisterButton: true,
        showVoteButton: false,
        showLoginButton: false,
        showConnectWallet: false,
      };
    }
  } else if (authType === "anon") {
    if (anonAadhaarStatus === "logged-out") {
      return {
        canVote: false,
        message: "Please login using AnonAadhaar to vote",
        showRegisterButton: false,
        showVoteButton: false,
        showLoginButton: true,
        showConnectWallet: false,
      };
    }

    if (!isUserRegistered && anonAadhaarStatus === "logged-in") {
      return {
        canVote: false,
        message: "Please register to vote",
        showRegisterButton: true,
        showVoteButton: false,
        showLoginButton: false,
        showConnectWallet: false,
      };
    }
  }

  if (isVotesInvalid) {
    return {
      canVote: false,
      message: "Invalid vote selection",
      showRegisterButton: false,
      showVoteButton: false,
      showLoginButton: false,
      showConnectWallet: false,
    };
  }

  if (isUserRegistered && pollStatus === PollStatus.OPEN) {
    return {
      canVote: true,
      message: null,
      showRegisterButton: false,
      showVoteButton: true,
      showLoginButton: false,
      showConnectWallet: false,
    };
  }

  return {
    canVote: false,
    message: null,
    showRegisterButton: false,
    showVoteButton: false,
    showLoginButton: false,
    showConnectWallet: false,
  };
};

export default useVotingState;
