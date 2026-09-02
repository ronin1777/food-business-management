import { apiClient } from "./client";

import type {
  DashboardResponse,
} from "@/types/dashboard";

type DashboardParams = {
  dateFrom: string;
  dateTo: string;
};

export async function getDashboard(
  params: DashboardParams,
): Promise<DashboardResponse> {
  const searchParams =
    new URLSearchParams({
      date_from: params.dateFrom,
      date_to: params.dateTo,
    });

  return apiClient<DashboardResponse>(
    `/api/dashboard/?${searchParams.toString()}`,
  );
}