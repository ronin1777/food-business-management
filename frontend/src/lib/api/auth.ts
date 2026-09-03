
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
      skipRefresh: true,
    },
  );
}

export async function register(
  username: string,
  firstName: string,
  lastName: string,
  password: string,
  organizationName: string,
): Promise<AuthResponse> {
  return apiClient<AuthResponse>(
    "/api/auth/register/",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        first_name: firstName,
        last_name: lastName,
        password,
        organization_name: organizationName,
      }),
      skipRefresh: true,
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

