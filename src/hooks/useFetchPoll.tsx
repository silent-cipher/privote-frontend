import { useScaffoldContractRead } from "./scaffold-eth";

type ContractName = "PrivoteFreeForAll" | "PrivoteAnonAadhaar";

export const useFetchPoll = (
  id: bigint | undefined,
  contractName: ContractName
) =>
  useScaffoldContractRead({
    contractName,
    functionName: "fetchPoll",
    args: [id],
  });
