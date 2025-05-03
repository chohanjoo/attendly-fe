"use client";

import { QueryClientProvider as TanStackQueryProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "@/lib/query-client";

interface QueryClientProviderProps {
  children: ReactNode;
}

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  return (
    <TanStackQueryProvider client={queryClient}>
      {children}
    </TanStackQueryProvider>
  );
} 