import { apiClient } from "./client";

import type {
  Product,
  ProductListParams,
  ProductResponse,
  ProductsResponse,
} from "@/types/products";

export async function getProducts(
  params: ProductListParams = {},
): Promise<ProductsResponse> {
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

  if (params.orderedAt) {
    searchParams.set(
      "ordered_at",
      params.orderedAt,
    );
  }

  const query =
    searchParams.toString();

  return apiClient<ProductsResponse>(
    `/api/products/${query ? `?${query}` : ""}`,
  );
}

export async function getProduct(
  productId: number,
): Promise<Product> {
  return apiClient<Product>(
    `/api/products/${productId}/`,
  );
}

export type CreateProductPayload = {
  name: string;
  selling_price: number;
  is_active?: boolean;
};

export async function createProduct(
  payload: CreateProductPayload,
): Promise<ProductResponse> {
  return apiClient<ProductResponse>(
    "/api/products/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export type UpdateProductPayload = {
  name?: string;
  selling_price?: number;
  is_active?: boolean;
};

export async function updateProduct(
  productId: number,
  payload: UpdateProductPayload,
): Promise<Product> {
  return apiClient<Product>(
    `/api/products/${productId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}