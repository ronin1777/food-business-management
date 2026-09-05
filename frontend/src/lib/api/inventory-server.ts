import "server-only";

import { serverApi } from "./server";

import type {
  InventoryTransactionDetailResponse,
  InventoryTransactionListParams,
  InventoryTransactionsResponse,
} from "@/types/inventory";

export async function getInventoryTransactionsServer(
  params: InventoryTransactionListParams = {},
): Promise<InventoryTransactionsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.set(
      "page_size",
      String(params.pageSize),
    );
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.ordering) {
    searchParams.set("ordering", params.ordering);
  }

  if (params.ingredient) {
    searchParams.set(
      "ingredient",
      String(params.ingredient),
    );
  }

  if (params.transaction_type) {
    searchParams.set(
      "transaction_type",
      params.transaction_type,
    );
  }

  if (params.created_at_after) {
    searchParams.set(
      "created_at_after",
      params.created_at_after,
    );
  }

  if (params.created_at_before) {
    searchParams.set(
      "created_at_before",
      params.created_at_before,
    );
  }

  const query =
    searchParams.toString();

  return serverApi<InventoryTransactionsResponse>(
    `/api/inventory-transactions/${
      query ? `?${query}` : ""
    }`,
  );
}

export async function getInventoryTransactionServer(
  transactionId: number,
): Promise<InventoryTransactionDetailResponse> {
  return serverApi<InventoryTransactionDetailResponse>(
    `/api/inventory-transactions/${transactionId}/`,
  );
}