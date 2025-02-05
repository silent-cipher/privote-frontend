"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useParams, useSearchParams } from "next/navigation";
import { useFetchPoll } from "~~/hooks/useFetchPoll";
import { PollType, AuthType, RawPoll } from "~~/types/poll";
import { useSigContext } from "./SigContext";
import { getMaciContractName } from "~~/utils/maciName";

interface IPollContext {
  authType: string | null;
  poll: RawPoll | undefined;
  isLoading: boolean;
  isError: boolean;
  isRegistered: boolean;
  stateIndex: bigint | null;
}

export const PollContext = createContext<IPollContext>({} as IPollContext);

export default function PollContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const searchParams = useSearchParams();
  const pollId = params.id;
  const authType = (searchParams.get("authType") as AuthType) || "free";
  const pollType =
    (Number(searchParams.get("pollType")) as PollType) || PollType.SINGLE_VOTE;
  const { address, isConnected } = useAccount();

  const { keypair } = useSigContext();
  const [stateIndex, setStateIndex] = useState<bigint | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const contractName = getMaciContractName(authType, pollType);
  const {
    data: poll,
    isLoading,
    isError,
  } = useFetchPoll(BigInt(pollId as string), contractName);

  const { data: index, refetch: refetchIndex } = useScaffoldContractRead({
    contractName,
    functionName: "pubKeyToStateIndex",
    args: keypair ? keypair.pubKey.rawPubKey : [0n, 0n],
  });

  useEffect(() => {
    setIsRegistered(false);
    if (index) {
      setStateIndex(index ? BigInt(index - 1) : null);
      setIsRegistered(!!index);
    }
  }, [index, keypair, address, isConnected]);

  return (
    <PollContext.Provider
      value={{
        isRegistered,
        poll,
        isLoading,
        isError,
        stateIndex,
        authType,
      }}
    >
      {children}
    </PollContext.Provider>
  );
}

export const usePollContext = () => useContext(PollContext);
