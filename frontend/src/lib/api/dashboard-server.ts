import "server-only";

import { serverApi } from "./server";

import type {
  DashboardResponse,
} from "@/types/dashboard";

type DashboardParams = {
  dateFrom: string;
  dateTo: string;
};

export async function getDashboardServer(
  params: DashboardParams,
): Promise<DashboardResponse> {
  const searchParams =
    new URLSearchParams({
      date_from: params.dateFrom,
      date_to: params.dateTo,
    });

  return serverApi<DashboardResponse>(
    `/api/dashboard/?${searchParams.toString()}`,
  );
}