import { apiClient } from "./client";

import type {
  AuthResponse,
} from "@/types/auth";

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>(
    "/api/auth/login/",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    },
  );
}

export async function register(
  username: string,
  password: string,
  organizationName: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>(
    "/api/auth/register/",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        organization_name: organizationName,
      }),
    },
  );
}

export async function me(): Promise<AuthResponse> {
  return apiClient<AuthResponse>(
    "/api/auth/me/",
  );
}

export async function refresh(): Promise<void> {
  await apiClient(
    "/api/auth/refresh/",
    {
      method: "POST",
    },
  );
}

export async function logout(): Promise<void> {
  await apiClient(
    "/api/auth/logout/",
    {
      method: "POST",
    },
  );
}