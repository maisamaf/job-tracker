import { useQuery } from "@tanstack/react-query";
import {
  searchApplications,
  SearchApplicationResult,
} from "../actions/search-applications";

export function useSearchApplications(query: string) {
  return useQuery({
    queryKey: ["applications", "search", query],
    queryFn: () => searchApplications(query),
    enabled: query.trim().length >= 1,
    staleTime: 30_000,
    placeholderData: (prev: SearchApplicationResult[] | undefined) => prev,
  });
}
