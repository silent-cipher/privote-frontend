import { useScaffoldContractRead } from "./scaffold-eth";

type ContractName =
  | "privote_free_single"
  | "privote_free_multi"
  | "privote_anon_single"
  | "privote_anon_multi";

export const useFetchPoll = (
  id: bigint | undefined,
  contractName: ContractName
) =>
  useScaffoldContractRead({
    contractName,
    functionName: "fetchPoll",
    args: [id],
  });
