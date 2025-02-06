import { useEffect, useState } from "react";
import { useScaffoldContractRead } from "./scaffold-eth";
import { Poll, PollStatus, RawPoll } from "~~/types/poll";

export function getPollStatus(poll: RawPoll) {
  const now = Math.round(new Date().getTime() / 1000);

  if (poll.startTime > BigInt(now)) {
    return PollStatus.NOT_STARTED;
  }

  if (poll.endTime > BigInt(now)) {
    return PollStatus.OPEN;
  }

  if (!poll.isTallied) {
    return PollStatus.CLOSED;
  }

  return PollStatus.RESULT_COMPUTED;
}

export const useFetchPolls = (currentPage = 1, limit = 25, reversed = true) => {
  const [polls, setPolls] = useState<Poll[]>();

  // Get total polls from each contract
  const { data: totalFreeSinglePolls, refetch: refetchTotalFreeSinglePolls } =
    useScaffoldContractRead({
      contractName: "privote_free_single",
      functionName: "nextPollId",
    });

  const { data: totalFreeMultiPolls, refetch: refetchTotalFreeMultiPolls } =
    useScaffoldContractRead({
      contractName: "privote_free_multi",
      functionName: "nextPollId",
    });

  const { data: totalAnonSinglePolls, refetch: refetchTotalAnonSinglePolls } =
    useScaffoldContractRead({
      contractName: "privote_anon_single",
      functionName: "nextPollId",
    });

  const { data: totalAnonMultiPolls, refetch: refetchTotalAnonMultiPolls } =
    useScaffoldContractRead({
      contractName: "privote_anon_multi",
      functionName: "nextPollId",
    });

  // Calculate total polls across all contracts
  const totalPolls =
    Number(totalFreeSinglePolls || 0n) +
    Number(totalFreeMultiPolls || 0n) +
    Number(totalAnonSinglePolls || 0n) +
    Number(totalAnonMultiPolls || 0n);

  // Calculate limits proportionally
  const getContractLimit = (contractTotal: bigint) => {
    if (totalPolls === 0) return limit / 4;
    return contractTotal === 0n
      ? 0
      : (limit * Number(contractTotal)) / totalPolls;
  };

  const freeSingleLimit = getContractLimit(totalFreeSinglePolls || 0n);
  const freeMultiLimit = getContractLimit(totalFreeMultiPolls || 0n);
  const anonSingleLimit = getContractLimit(totalAnonSinglePolls || 0n);
  const anonMultiLimit = getContractLimit(totalAnonMultiPolls || 0n);

  // Fetch polls from each contract
  const {
    data: rawFreeSinglePolls,
    refetch: refetchFreeSinglePolls,
    isLoading: isLoadingFreeSinglePolls,
    error: errorFreeSinglePolls,
  } = useScaffoldContractRead({
    contractName: "privote_free_single",
    functionName: "fetchPolls",
    args: [BigInt(currentPage), BigInt(Math.ceil(freeSingleLimit)), reversed],
  });

  const {
    data: rawFreeMultiPolls,
    refetch: refetchFreeMultiPolls,
    isLoading: isLoadingFreeMultiPolls,
    error: errorFreeMultiPolls,
  } = useScaffoldContractRead({
    contractName: "privote_free_multi",
    functionName: "fetchPolls",
    args: [BigInt(currentPage), BigInt(Math.ceil(freeMultiLimit)), reversed],
  });

  const {
    data: rawAnonSinglePolls,
    refetch: refetchAnonSinglePolls,
    isLoading: isLoadingAnonSinglePolls,
    error: errorAnonSinglePolls,
  } = useScaffoldContractRead({
    contractName: "privote_anon_single",
    functionName: "fetchPolls",
    args: [BigInt(currentPage), BigInt(Math.ceil(anonSingleLimit)), reversed],
  });

  const {
    data: rawAnonMultiPolls,
    refetch: refetchAnonMultiPolls,
    isLoading: isLoadingAnonMultiPolls,
    error: errorAnonMultiPolls,
  } = useScaffoldContractRead({
    contractName: "privote_anon_multi",
    functionName: "fetchPolls",
    args: [BigInt(currentPage), BigInt(Math.ceil(anonMultiLimit)), reversed],
  });

  const refetchTotalPolls = () => {
    refetchTotalFreeSinglePolls();
    refetchTotalFreeMultiPolls();
    refetchTotalAnonSinglePolls();
    refetchTotalAnonMultiPolls();
  };

  const refetchAllPolls = () => {
    refetchFreeSinglePolls();
    refetchFreeMultiPolls();
    refetchAnonSinglePolls();
    refetchAnonMultiPolls();
  };

  const refetchPolls = refetchAllPolls;
  const isLoading =
    isLoadingFreeSinglePolls ||
    isLoadingFreeMultiPolls ||
    isLoadingAnonSinglePolls ||
    isLoadingAnonMultiPolls;
  const error =
    errorFreeSinglePolls ||
    errorFreeMultiPolls ||
    errorAnonSinglePolls ||
    errorAnonMultiPolls;

  const [lastTimer, setLastTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (lastTimer) {
      clearInterval(lastTimer);
    }

    if (
      !rawFreeSinglePolls ||
      !rawFreeMultiPolls ||
      !rawAnonSinglePolls ||
      !rawAnonMultiPolls
    ) {
      setPolls([]);
      return;
    }

    const interval = setInterval(() => {
      const _polls: Poll[] = [];

      const addPollsToArray = (rawPolls: readonly RawPoll[]) => {
        for (const rawPoll of rawPolls) {
          _polls.push({
            ...rawPoll,
            status: getPollStatus(rawPoll),
          });
        }
      };

      addPollsToArray(rawFreeSinglePolls);
      addPollsToArray(rawFreeMultiPolls);
      addPollsToArray(rawAnonSinglePolls);
      addPollsToArray(rawAnonMultiPolls);

      setPolls(_polls.sort((a, b) => Number(b.startTime - a.startTime)));
    }, 1000);

    setLastTimer(interval);

    return () => {
      clearInterval(interval);
    };
  }, [
    rawFreeSinglePolls,
    rawFreeMultiPolls,
    rawAnonSinglePolls,
    rawAnonMultiPolls,
  ]);

  function refetch() {
    refetchTotalPolls();
    refetchPolls();
  }

  return {
    totalPolls,
    polls,
    refetch,
    isLoading,
    error,
  };
};
