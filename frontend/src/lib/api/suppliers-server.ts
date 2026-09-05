import "server-only";

import { serverApi } from "./server";

import type {
  SupplierAccountResponse,
  SupplierDetailResponse,
  SupplierListParams,
  SupplierTransactionListParams,
  SupplierTransactionsResponse,
  SuppliersResponse,
} from "@/types/suppliers";

export async function getSuppliersServer(
  params: SupplierListParams = {},
): Promise<SuppliersResponse> {
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

  if (params.ordering) {
    searchParams.set(
      "ordering",
      params.ordering,
    );
  }

  const query =
    searchParams.toString();

  return serverApi<SuppliersResponse>(
    `/api/suppliers/${
      query ? `?${query}` : ""
    }`,
  );
}

export async function getSupplierServer(
  supplierId: number,
): Promise<SupplierDetailResponse> {
  return serverApi<SupplierDetailResponse>(
    `/api/suppliers/${supplierId}/`,
  );
}

export async function getSupplierAccountServer(
  supplierId: number,
): Promise<SupplierAccountResponse> {
  return serverApi<SupplierAccountResponse>(
    `/api/supplier-accounts/${supplierId}/`,
  );
}

export async function getSupplierTransactionsServer(
  params: SupplierTransactionListParams = {},
): Promise<SupplierTransactionsResponse> {
  const searchParams =
    new URLSearchParams();

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

  if (params.ordering) {
    searchParams.set(
      "ordering",
      params.ordering,
    );
  }

  if (params.supplier) {
    searchParams.set(
      "supplier",
      String(params.supplier),
    );
  }

  if (params.transactionType) {
    searchParams.set(
      "transaction_type",
      params.transactionType,
    );
  }

  if (params.direction) {
    searchParams.set(
      "direction",
      params.direction,
    );
  }

  if (params.purchase) {
    searchParams.set(
      "purchase",
      String(params.purchase),
    );
  }

  const query =
    searchParams.toString();

  return serverApi<SupplierTransactionsResponse>(
    `/api/supplier-transactions/${
      query ? `?${query}` : ""
    }`,
  );
}