import { AuthType, PollType } from "~~/types/poll";

export const getMaciContractName = (authType: AuthType, pollType: PollType) => {
  switch (authType) {
    case AuthType.FREE:
      switch (pollType) {
        case PollType.SINGLE_VOTE:
          return "privote_free_single";
        case PollType.MULTIPLE_VOTE:
          return "privote_free_multi";
        case PollType.WEIGHTED_MULTIPLE_VOTE:
          return "privote_free_multi";
        default:
          return "privote_free_single";
      }
    case AuthType.ANON:
      switch (pollType) {
        case PollType.SINGLE_VOTE:
          return "privote_anon_single";
        case PollType.MULTIPLE_VOTE:
          return "privote_anon_multi";
        case PollType.WEIGHTED_MULTIPLE_VOTE:
          return "privote_anon_multi";
        default:
          return "privote_anon_single";
      }
    default:
      throw new Error("Invalid auth type");
  }
};
