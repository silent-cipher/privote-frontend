import { useState, useEffect } from "react";
import { getDataFromLighthouse } from "~~/utils/lighthouse";
import { RawPoll, AuthType, PollType } from "~~/types/poll";
import { useFetchPollResult } from "./useFetchPollResult";
import { getMaciContractName } from "~~/utils/maciName";

interface IResult {
  candidate: string;
  votes: number;
}

interface UsePollResultsReturn {
  result: IResult[] | null;
  totalVotes: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePollResults = (
  poll: RawPoll | undefined,
  authType: AuthType,
  pollType: PollType
): UsePollResultsReturn => {
  const [result, setResult] = useState<IResult[] | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { data: tally, isLoading: pollTallyLoading } = useFetchPollResult(
    poll && BigInt(poll?.id),
    getMaciContractName(authType, pollType)
  );

  const fetchResults = async () => {
    if (!poll || !tally) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!poll.options || poll.options.length > tally.length) {
        throw new Error("Invalid tally data");
      }

      const tallyCounts: number[] = tally
        .map((v: bigint) => Number(v))
        .slice(0, poll.options.length);

      const results = poll.options.map((candidate: string, i: number) => ({
        candidate,
        votes: tallyCounts[i],
      }));

      results.sort((a: IResult, b: IResult) => b.votes - a.votes);
      const total = results.reduce(
        (acc: number, cur: IResult) => acc + cur.votes,
        0
      );

      setResult(results);
      setTotalVotes(total);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch results")
      );
      console.error("Error fetching poll results:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [tally]);

  return {
    result,
    totalVotes,
    isLoading,
    error,
    refetch: fetchResults,
  };
};

export default usePollResults;
