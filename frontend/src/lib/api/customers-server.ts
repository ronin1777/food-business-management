import "server-only";

import { serverApi } from "./server";

import type {
  CustomerAccountResponse,
  CustomerDetail,
  CustomerDetailResponse,
  CustomerListParams,
  CustomerTransactionListParams,
  CustomerTransactionsResponse,
  CustomersResponse,
} from "@/types/customers";

export async function getCustomersServer(
  params: CustomerListParams = {},
): Promise<CustomersResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.ordering) {
    searchParams.set("ordering", params.ordering);
  }

  const query = searchParams.toString();

  return serverApi<CustomersResponse>(
    `/api/customers/${query ? `?${query}` : ""}`,
  );
}

export async function getCustomerServer(
  customerId: number,
): Promise<CustomerDetail> {
  return serverApi<CustomerDetail>(
    `/api/customers/${customerId}/`,
  );
}

export async function getCustomerAccountServer(
  customerId: number,
): Promise<CustomerAccountResponse> {
  return serverApi<CustomerAccountResponse>(
    `/api/customer-accounts/${customerId}/`,
  );
}

export async function getCustomerTransactionsServer(
  params: CustomerTransactionListParams = {},
): Promise<CustomerTransactionsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.set("page_size", String(params.pageSize));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.ordering) {
    searchParams.set("ordering", params.ordering);
  }

  if (params.customer) {
    searchParams.set("customer", String(params.customer));
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

  const query = searchParams.toString();

  return serverApi<CustomerTransactionsResponse>(
    `/api/customer-transactions/${query ? `?${query}` : ""}`,
  );
}