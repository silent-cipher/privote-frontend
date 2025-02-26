import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useAccountBalance } from "./scaffold-eth/useAccountBalance";

const MIN_BALANCE = 0.001; // Minimum balance required in ETH

export const useBalanceCheck = () => {
  const { address, isConnected } = useAccount();
  const { chain, chains } = useNetwork();
  const { balance, isLoading } = useAccountBalance(address);
  const [showFaucetModal, setShowFaucetModal] = useState(false);

  useEffect(() => {
    const isSupportedChain = chains?.some((c) => c?.id === chain?.id);

    if (!isSupportedChain) {
      setShowFaucetModal(false);
      return;
    }

    if (isSupportedChain && isConnected && !isLoading && balance !== null) {
      const hasInsufficientBalance = balance < MIN_BALANCE;

      setShowFaucetModal(hasInsufficientBalance);
    } else {
      setShowFaucetModal(false);
    }
  }, [isConnected, chain?.id, balance, isLoading, chains]);

  return {
    showFaucetModal,
    onCloseFaucetModal: () => setShowFaucetModal(false),
  };
};
