
import "server-only";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured.",
  );
}

export type ServerApiErrorResponse = {
  success: false;
  data: null;
  message: string;
  errors: unknown;
};

export class ServerApiError extends Error {
  readonly status: number;
  readonly errors: unknown;
  readonly endpoint: string;

  constructor(
    message: string,
    status: number,
    errors: unknown = null,
    endpoint = "",
  ) {
    super(message);

    this.name = "ServerApiError";
    this.status = status;
    this.errors = errors;
    this.endpoint = endpoint;

    Object.setPrototypeOf(
      this,
      ServerApiError.prototype,
    );
  }
}

async function parseErrorResponse(
  response: Response,
): Promise<{
  message: string;
  errors: unknown;
}> {
  let errorBody:
    | Partial<ServerApiErrorResponse>
    | null = null;

  try {
    errorBody = await response.json();
  } catch {
    // Response body is empty or not valid JSON.
  }

  return {
    message:
      typeof errorBody?.message === "string" &&
      errorBody.message.trim()
        ? errorBody.message
        : `API request failed with status ${response.status}.`,

    errors:
      errorBody?.errors ?? null,
  };
}

export async function serverApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(
      ({ name, value }) =>
        `${name}=${value}`,
    )
    .join("; ");

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : {
                "Content-Type":
                  "application/json",
              }),

          ...(cookieHeader
            ? {
                Cookie: cookieHeader,
              }
            : {}),

          ...options.headers,
        },
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error(
      "Server API request failed:",
      error,
    );

    throw new ServerApiError(
      "ارتباط با سرور برقرار نشد.",
      0,
      null,
      endpoint,
    );
  }

  if (!response.ok) {
    const { message, errors } =
      await parseErrorResponse(response);

    throw new ServerApiError(
      message,
      response.status,
      errors,
      endpoint,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ServerApiError(
      "پاسخ نامعتبر از سرور دریافت شد.",
      response.status,
      null,
      endpoint,
    );
  }
}

