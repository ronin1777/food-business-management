import "server-only";

import { serverApi } from "./server";

import type {
  OrderDetail,
  OrderFilters,
  OrdersResponse,
} from "@/types/orders";

export async function getOrdersServer(
  filters: OrderFilters = {},
): Promise<OrdersResponse> {
  const searchParams = new URLSearchParams();

  if (filters.page) {
    searchParams.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    searchParams.set("page_size", String(filters.pageSize));
  }

  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  if (filters.customer) {
    searchParams.set("customer", String(filters.customer));
  }

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  if (filters.paymentStatus) {
    searchParams.set(
      "payment_status",
      filters.paymentStatus,
    );
  }

  if (filters.orderedAtAfter) {
    searchParams.set(
      "ordered_at_after",
      filters.orderedAtAfter,
    );
  }

  if (filters.orderedAtBefore) {
    searchParams.set(
      "ordered_at_before",
      filters.orderedAtBefore,
    );
  }

  if (filters.ordering) {
    searchParams.set(
      "ordering",
      filters.ordering,
    );
  }

  const query = searchParams.toString();

  return serverApi<OrdersResponse>(
    `/api/orders/${query ? `?${query}` : ""}`,
  );
}

export async function getOrderServer(
  orderId: number,
): Promise<OrderDetail> {
  return serverApi<OrderDetail>(
    `/api/orders/${orderId}/`,
  );
}