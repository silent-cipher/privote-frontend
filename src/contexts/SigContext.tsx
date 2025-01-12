"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Keypair, PrivKey } from "maci-domainobjs";
import { useAccount, useSignMessage } from "wagmi";

interface ISigContext {
  keypair: Keypair | null;
  generateKeypair: () => void;
}

export const SigContext = createContext<ISigContext>({} as ISigContext);

export default function SigContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useAccount();
  const [keypair, setKeyPair] = useState<Keypair | null>(null);
  const [signatureMessage, setSignatureMessage] = useState<string>("");

  const { signMessageAsync } = useSignMessage({ message: signatureMessage });

  useEffect(() => {
    setSignatureMessage(`Login to ${window.location.origin}`);
  }, []);

  const generateKeypair = useCallback(() => {
    if (!address) return;

    (async () => {
      try {
        const signature = await signMessageAsync();
        const userKeyPair = new Keypair(new PrivKey(signature));
        setKeyPair(userKeyPair);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [address, signMessageAsync]);

  useEffect(() => {
    setKeyPair(null);
    generateKeypair();
  }, [generateKeypair]);

  return (
    <SigContext.Provider
      value={{
        keypair,
        generateKeypair,
      }}
    >
      {children}
    </SigContext.Provider>
  );
}

export const useSigContext = () => useContext(SigContext);
