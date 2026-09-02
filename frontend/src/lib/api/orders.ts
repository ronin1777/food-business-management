import { apiClient } from "./client";

import type {
  OrderDetail,
  OrderFilters,
  OrdersResponse,
} from "@/types/orders";

export async function getOrders(
  filters: OrderFilters = {},
): Promise<OrdersResponse> {
  const searchParams =
    new URLSearchParams();

  if (filters.page) {
    searchParams.set(
      "page",
      String(filters.page),
    );
  }

  if (filters.pageSize) {
    searchParams.set(
      "page_size",
      String(filters.pageSize),
    );
  }

  if (filters.search) {
    searchParams.set(
      "search",
      filters.search,
    );
  }

  if (filters.customer) {
    searchParams.set(
      "customer",
      String(filters.customer),
    );
  }

  if (filters.status) {
    searchParams.set(
      "status",
      filters.status,
    );
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

  const query =
    searchParams.toString();

  return apiClient<OrdersResponse>(
    `/api/orders/${query ? `?${query}` : ""}`,
  );
}

export async function getOrder(
  orderId: number,
): Promise<OrderDetail> {
  return apiClient<OrderDetail>(
    `/api/orders/${orderId}/`,
  );
}


type CancelOrderResponse = {
  id: number;
  status: "completed" | "cancelled";
  message: string;
};

export async function cancelOrder(
  orderId: number,
  note = "",
): Promise<CancelOrderResponse> {
  return apiClient<CancelOrderResponse>(
    `/api/orders/${orderId}/cancel/`,
    {
      method: "POST",
      body: JSON.stringify({
        note,
      }),
    },
  );
}


export type CreateOrderItemPayload = {
  product: number;
  quantity: number;
};

export type CreateOrderPayload = {
  customer?: number | null;
  ordered_at: string;
  items: CreateOrderItemPayload[];
  note?: string;
};

export type CreateOrderResponse = {
  id: number;
  message: string;
};

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  return apiClient<CreateOrderResponse>(
    "/api/orders/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}