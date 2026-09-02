export type Organization = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
  organization: Organization;
};

export type AuthResponse = {
  success: boolean;
  data: {
    user: User;
  } | null;
  message: string | null;
  errors: unknown;
};