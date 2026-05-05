/**
 * TanStack Query + tRPC providers — wraps the entire app so any
 * client component can call `trpc.<router>.<procedure>.useQuery()`.
 *
 * Single QueryClient per browser tab (avoids cache fragmentation).
 * Default options match v15 BP §9.5 expectations:
 *   - `staleTime: 30s` (cold-start corridor count etc. is allowed to
 *     be slightly stale; SLA-bound flows pass `staleTime: 0`).
 *   - Retries off in dev for fast feedback; one retry in prod for
 *     transient network errors.
 *
 * v16 web pivot §P1.b.
 */
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc, getTrpcUrl } from "@/lib/trpc";

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: process.env.NODE_ENV === "production" ? 1 : 0,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getTrpcUrl(),
          fetch(url, options) {
            return fetch(url, { ...options, credentials: "include" });
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
