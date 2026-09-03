export type Organization = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type OrganizationResponse = {
  success: boolean;
  data: Organization;
  message: string | null;
  errors: unknown;
};