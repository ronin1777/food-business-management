"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getMyOrganization } from "@/lib/api/organizations";
import type { Organization } from "@/types/organizations";

type OrganizationContextValue = {
  organization: Organization | null;
  loading: boolean;
  refreshOrganization: () => Promise<void>;
};

const OrganizationContext =
  createContext<OrganizationContextValue | undefined>(
    undefined,
  );

type OrganizationProviderProps = {
  children: ReactNode;
};

export function OrganizationProvider({
  children,
}: OrganizationProviderProps) {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadOrganization() {
    try {
      setLoading(true);

      const response =
        await getMyOrganization();
      

      setOrganization(response.data);
    } catch (error) {
      console.error(
        "Failed to load organization:",
        error,
      );

      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrganization();
  }, []);

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        loading,
        refreshOrganization: loadOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context =
    useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      "useOrganization must be used inside OrganizationProvider.",
    );
  }

  return context;
}