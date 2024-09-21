import { useScaffoldContractRead } from "./scaffold-eth";

export const useFetchPoll = (id: bigint | undefined) =>
  useScaffoldContractRead({
    contractName: "Privote",
    functionName: "fetchPoll",
    args: [id],
  });
