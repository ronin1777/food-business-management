import { apiClient } from "./client";

export type CustomerPaymentMethod =
  | "cash"
  | "card"
  | "transfer";

export type CreateCustomerPaymentPayload = {
  customer: number;
  order?: number | null;
  amount: number;
  method: CustomerPaymentMethod;
  paid_at: string;
  note?: string;
};

export type CreateCustomerPaymentResponse = {
  id: number;
};

export async function createCustomerPayment(
  payload: CreateCustomerPaymentPayload,
): Promise<CreateCustomerPaymentResponse> {
  return apiClient<CreateCustomerPaymentResponse>(
    "/api/customer-payments/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}