import { apiClient } from "./client";

import type {
  Supplier,
  SupplierAccountResponse,
  SupplierDetail,
  SupplierDetailResponse,
  SupplierListParams,
  SupplierTransactionListParams,
  SupplierTransactionsResponse,
  SuppliersResponse,
} from "@/types/suppliers";

export async function getSuppliers(
  params: SupplierListParams = {},
): Promise<SuppliersResponse> {
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

  return apiClient<SuppliersResponse>(
    `/api/suppliers/${query ? `?${query}` : ""}`,
  );
}

// export async function getSupplier(
//   supplierId: number,
// ): Promise<SupplierDetail> {
//   return apiClient<SupplierDetail>(
//     `/api/suppliers/${supplierId}/`,
//   );
// }


export async function getSupplier(
  supplierId: number,
): Promise<SupplierDetailResponse> {
  return apiClient<SupplierDetailResponse>(
    `/api/suppliers/${supplierId}/`,
  );
}


export type CreateSupplierPayload = {
  name: string;
  phone?: string;
  is_active?: boolean;
};

export async function createSupplier(
  payload: CreateSupplierPayload,
): Promise<SupplierDetail> {
  return apiClient<SupplierDetail>(
    "/api/suppliers/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type UpdateSupplierPayload = {
  name?: string;
  phone?: string;
  is_active?: boolean;
};

export async function updateSupplier(
  supplierId: number,
  payload: UpdateSupplierPayload,
): Promise<SupplierDetail> {
  return apiClient<SupplierDetail>(
    `/api/suppliers/${supplierId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function getSupplierAccount(
  supplierId: number,
): Promise<SupplierAccountResponse> {
  return apiClient<SupplierAccountResponse>(
    `/api/supplier-accounts/${supplierId}/`,
  );
}

export async function getSupplierTransactions(
  params: SupplierTransactionListParams = {},
): Promise<SupplierTransactionsResponse> {
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

  return apiClient<SupplierTransactionsResponse>(
    `/api/supplier-transactions/${
      query ? `?${query}` : ""
    }`,
  );
}

export type CreateSupplierRefundPayload = {
  supplier: number;
  purchase: number;
  amount: number;
  note?: string;
};

export async function createSupplierRefund(
  payload: CreateSupplierRefundPayload,
) {
  return apiClient(
    "/api/supplier-refunds/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}