import { apiClient } from "./client";

import type {
  OrganizationResponse,
} from "@/types/organizations";

export async function getMyOrganization() {
  return apiClient<OrganizationResponse>(
    "/api/organizations/me/",
  );
}