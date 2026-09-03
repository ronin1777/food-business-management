
import "server-only";

import { serverApi } from "./server";

import type { AuthResponse } from "@/types/auth";

export async function meServer(): Promise<AuthResponse> {
  return serverApi<AuthResponse>(
    "/api/auth/me/",
  );
}

