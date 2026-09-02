import { apiClient } from "./client";

import type {
  CreatePurchasePayload,
  CreatePurchaseResponse,
  PurchaseDetail,
  PurchaseDetailResponse,
  PurchaseListParams,
  PurchasesResponse,
} from "@/types/purchases";

export async function getPurchases(
  params: PurchaseListParams = {},
): Promise<PurchasesResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.pageSize) {
    searchParams.set(
      "page_size",
      String(params.pageSize),
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.supplier) {
    searchParams.set(
      "supplier",
      String(params.supplier),
    );
  }

  if (params.purchasedAtAfter) {
    searchParams.set(
      "purchased_at_after",
      params.purchasedAtAfter,
    );
  }

  if (params.purchasedAtBefore) {
    searchParams.set(
      "purchased_at_before",
      params.purchasedAtBefore,
    );
  }

  if (params.ordering) {
    searchParams.set(
      "ordering",
      params.ordering,
    );
  }

  const query =
    searchParams.toString();

  return apiClient<PurchasesResponse>(
    `/api/purchases/${query ? `?${query}` : ""}`,
  );
}

// export async function getPurchase(
//   purchaseId: number,
// ): Promise<PurchaseDetail> {
//   return apiClient<PurchaseDetail>(
//     `/api/purchases/${purchaseId}/`,
//   );
// }

export async function getPurchase(
  purchaseId: number,
): Promise<PurchaseDetailResponse> {
  return apiClient<PurchaseDetailResponse>(
    `/api/purchases/${purchaseId}/`,
  );
}

export async function createPurchase(
  payload: CreatePurchasePayload,
): Promise<CreatePurchaseResponse> {
  return apiClient<CreatePurchaseResponse>(
    "/api/purchases/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type CancelPurchaseResponse = {
  id: number;
  status: "completed" | "cancelled";
};

export async function cancelPurchase(
  purchaseId: number,
  note = "",
): Promise<CancelPurchaseResponse> {
  return apiClient<CancelPurchaseResponse>(
    `/api/purchases/${purchaseId}/cancel/`,
    {
      method: "POST",
      body: JSON.stringify({
        note,
      }),
    },
  );
}