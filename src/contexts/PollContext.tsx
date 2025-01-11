"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Keypair, PrivKey, PubKey } from "maci-domainobjs";
import { useAccount, useSignMessage } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import {
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { useParams, useSearchParams } from "next/navigation";
import { useFetchPoll } from "~~/hooks/useFetchPoll";
import { PollStatus, RawPoll } from "~~/types/poll";
import { getPollStatus } from "~~/hooks/useFetchPolls";

interface IPollContext {
  authType: string | null;
  poll: RawPoll | undefined;
  isLoading: boolean;
  isError: boolean;
  isRegistered: boolean;
  keypair: Keypair | null;
  stateIndex: bigint | null;
  generateKeypair: () => void;
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
  const authType = searchParams.get("authType") || "none";
  const { address } = useAccount();
  const [keypair, setKeyPair] = useState<Keypair | null>(null);
  const [stateIndex, setStateIndex] = useState<bigint | null>(null);
  const [signatureMessage, setSignatureMessage] = useState<string>("");
  const { targetNetwork } = useTargetNetwork();

  const contractName =
    authType === "none" ? "PrivoteFreeForAll" : "PrivoteAnonAadhaar";
  const {
    data: poll,
    isLoading,
    isError,
  } = useFetchPoll(BigInt(pollId as string), contractName);

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
    if (poll && getPollStatus(poll) === PollStatus.OPEN) generateKeypair();
  }, [generateKeypair, poll]);

  const { data: isRegistered, refetch: refetchIsRegistered } =
    useScaffoldContractRead({
      contractName,
      functionName: "isPublicKeyRegistered",
      args: keypair ? keypair.pubKey.rawPubKey : [0n, 0n],
    });

  const deployedContract =
    poll?.authType === "none"
      ? deployedContracts[targetNetwork.id as keyof typeof deployedContracts]
          .PrivoteFreeForAll
      : deployedContracts[targetNetwork.id as keyof typeof deployedContracts]
          .PrivoteAnonAadhaar;

  const { data: SignUpEvents } = useScaffoldEventHistory({
    contractName,
    eventName: "SignUp",
    filters: {
      _userPubKeyX: BigInt(keypair?.pubKey.asContractParam().x || 0n),
      _userPubKeyY: BigInt(keypair?.pubKey.asContractParam().y || 0n),
    },
    fromBlock: BigInt(deployedContract.deploymentBlockNumber),
  });

  useEffect(() => {
    if (!keypair || !SignUpEvents || !SignUpEvents.length) {
      setStateIndex(null);
      return;
    }

    const event = SignUpEvents.filter(
      (log) =>
        log.args._userPubKeyX?.toString() ===
          keypair.pubKey.asContractParam().x &&
        log.args._userPubKeyY?.toString() === keypair.pubKey.asContractParam().y
    )[0];
    setStateIndex(event?.args?._stateIndex || null);
  }, [keypair, SignUpEvents]);

  useScaffoldEventSubscriber({
    contractName,
    eventName: "SignUp",
    listener: (logs) => {
      logs.forEach((log) => {
        if (
          log.args._userPubKeyX !== keypair?.pubKey.asContractParam().x ||
          log.args._userPubKeyY !== keypair?.pubKey.asContractParam().y
        )
          return;
        refetchIsRegistered();
        setStateIndex(log.args._stateIndex || null);
      });
    },
  });

  return (
    <PollContext.Provider
      value={{
        isRegistered: Boolean(isRegistered),
        poll,
        isLoading,
        isError,
        keypair,
        stateIndex,
        generateKeypair,
        authType,
      }}
    >
      {children}
    </PollContext.Provider>
  );
}

export const usePollContext = () => useContext(PollContext);
