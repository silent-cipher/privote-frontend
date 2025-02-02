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

  if (!poll.tallyJsonCID) {
    return PollStatus.CLOSED;
  }

  return PollStatus.RESULT_COMPUTED;
}

export const useFetchPolls = (currentPage = 1, limit = 25, reversed = true) => {
  const [polls, setPolls] = useState<Poll[]>();
  const { data: totalFreePolls, refetch: refetchTotalFreePolls } =
    useScaffoldContractRead({
      contractName: "PrivoteFreeForAll",
      functionName: "nextPollId",
    });

  const { data: totalAnonPolls, refetch: refetchTotalAnonPolls } =
    useScaffoldContractRead({
      contractName: "PrivoteAnonAadhaar",
      functionName: "nextPollId",
    });

  const freeLimit =
    totalAnonPolls === 0n
      ? limit
      : totalFreePolls && totalAnonPolls
      ? (limit * Number(totalFreePolls)) /
        (Number(totalFreePolls) + Number(totalAnonPolls))
      : limit / 2;
  const anonLimit =
    totalFreePolls === 0n
      ? limit
      : totalFreePolls && totalAnonPolls
      ? (limit * Number(totalAnonPolls)) /
        (Number(totalFreePolls) + Number(totalAnonPolls))
      : limit / 2;

  const {
    data: rawAllFreePolls,
    refetch: refetchAllFreePolls,
    isLoading: isLoadingAllFreePolls,
    error: errorAllFreePolls,
  } = useScaffoldContractRead({
    contractName: "PrivoteFreeForAll",
    functionName: "fetchPolls",
    args: [BigInt(currentPage), BigInt(Math.ceil(freeLimit)), reversed],
  });

  const {
    data: rawAllAnonPolls,
    refetch: refetchAllAnonPolls,
    isLoading: isLoadingAllAnonPolls,
    error: errorAllAnonPolls,
  } = useScaffoldContractRead({
    contractName: "PrivoteAnonAadhaar",
    functionName: "fetchPolls",
    args: [BigInt(currentPage), BigInt(Math.ceil(anonLimit)), reversed],
  });

  const refetchTotalPolls = () => {
    refetchTotalFreePolls();
    refetchTotalAnonPolls();
  };

  const refetchAllPolls = () => {
    refetchAllFreePolls();
    refetchAllAnonPolls();
  };

  // const rawPolls = rawAllFreePolls?.concat(rawAllAnonPolls || []);
  const refetchPolls = refetchAllPolls;
  const isLoading = isLoadingAllFreePolls || isLoadingAllAnonPolls;
  const error = errorAllFreePolls || errorAllAnonPolls;

  const [lastTimer, setLastTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (lastTimer) {
      clearInterval(lastTimer);
    }

    if (!rawAllAnonPolls || !rawAllFreePolls) {
      setPolls([]);
      return;
    }

    const interval = setInterval(() => {
      const _polls: Poll[] = [];

      for (const rawPoll of rawAllAnonPolls) {
        _polls.push({
          ...rawPoll,
          status: getPollStatus(rawPoll),
        });
      }

      for (const rawPoll of rawAllFreePolls) {
        _polls.push({
          ...rawPoll,
          status: getPollStatus(rawPoll),
        });
      }

      setPolls(_polls.sort((a, b) => Number(b.startTime - a.startTime)));
    }, 1000);

    setLastTimer(interval);

    () => {
      clearInterval(interval);
    };
  }, [rawAllFreePolls, rawAllAnonPolls]);

  function refetch() {
    refetchTotalPolls();
    refetchPolls();
  }

  return {
    totalPolls: Number(totalFreePolls || 0n) + Number(totalAnonPolls || 0n),
    polls,
    refetch,
    isLoading,
    error,
  };
};
