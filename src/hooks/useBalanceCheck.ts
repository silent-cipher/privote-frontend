"use client";
import { useState } from "react";
import { useAccount, useBalance, useChainId, useNetwork } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

const MIN_BALANCE = 0;

export const useBalanceCheck = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { chains } = useNetwork();
  const { data: balance, isLoading } = useBalance({ address, chainId });
  const [showFaucetModal, setShowFaucetModal] = useState(false);

  const checkBalance = () => {
    if (!address) {
      notification.error("Please connect your wallet");
      return true;
    }
    const isSupportedChain = chains?.some((c) => c?.id === chainId);

    if (!isSupportedChain) {
      notification.error("Please connect to a supported network");
      setShowFaucetModal(false);
      return true;
    }

    if (!isLoading && balance && Number(balance.value) <= MIN_BALANCE) {
      notification.error("Insufficient balance");
      setShowFaucetModal(true);

      return true;
    }

    return false;
  };

  return {
    showFaucetModal,
    onCloseFaucetModal: () => setShowFaucetModal(false),
    checkBalance,
  };
};
