// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// if (!API_URL) {
//   throw new Error(
//     "NEXT_PUBLIC_API_URL is not configured.",
//   );
// }

// type ApiRequestOptions = RequestInit & {
//   skipRefresh?: boolean;
// };

// let refreshPromise: Promise<boolean> | null = null;

// async function refreshAccessToken(): Promise<boolean> {
//   if (refreshPromise) {
//     return refreshPromise;
//   }

//   refreshPromise = (async () => {
//     try {
//       const response = await fetch(
//         `${API_URL}/api/auth/refresh/`,
//         {
//           method: "POST",
//           credentials: "include",
//         },
//       );

//       return response.ok;
//     } catch (error) {
//       console.error(
//         "Token refresh failed:",
//         error,
//       );

//       return false;
//     } finally {
//       refreshPromise = null;
//     }
//   })();

//   return refreshPromise;
// }

// export async function apiClient<T>(
//   endpoint: string,
//   options: ApiRequestOptions = {},
// ): Promise<T> {
//   const {
//     skipRefresh = false,
//     ...fetchOptions
//   } = options;

//   const response = await fetch(
//     `${API_URL}${endpoint}`,
//     {
//       ...fetchOptions,
//       credentials: "include",
//       headers: {
//         "Content-Type": "application/json",
//         ...fetchOptions.headers,
//       },
//     },
//   );

//   if (
//     response.status === 401 &&
//     !skipRefresh
//   ) {
//     const refreshed =
//       await refreshAccessToken();

//     if (!refreshed) {
//       throw new Error(
//         "Authentication required.",
//       );
//     }

//     return apiClient<T>(
//       endpoint,
//       {
//         ...options,
//         skipRefresh: true,
//       },
//     );
//   }

//   if (!response.ok) {
//     const errorBody = await response
//       .json()
//       .catch(() => null);

//     throw new Error(
//       errorBody?.message ??
//         `API request failed with status ${response.status}`,
//     );
//   }

//   return response.json();
// }



const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured.",
  );
}

type ApiRequestOptions = RequestInit & {
  skipRefresh?: boolean;
};

export type ApiErrorResponse = {
  success: false;
  data: null;
  message: string;
  errors: unknown;
};

export class ApiError extends Error {
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

    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.endpoint = endpoint;

    Object.setPrototypeOf(
      this,
      ApiError.prototype,
    );
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/refresh/`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      return response.ok;
    } catch (error) {
      console.error(
        "Token refresh failed:",
        error,
      );

      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function parseErrorResponse(
  response: Response,
): Promise<{
  message: string;
  errors: unknown;
}> {
  let errorBody: Partial<ApiErrorResponse> | null =
    null;

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

export async function apiClient<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    skipRefresh = false,
    ...fetchOptions
  } = options;

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...fetchOptions,
        credentials: "include",
        headers: {
          ...(fetchOptions.body instanceof FormData
            ? {}
            : {
                "Content-Type":
                  "application/json",
              }),

          ...fetchOptions.headers,
        },
      },
    );
  } catch (error) {
    console.error(
      "API request failed:",
      error,
    );

    throw new ApiError(
      "ارتباط با سرور برقرار نشد.",
      0,
      null,
      endpoint,
    );
  }

  if (
    response.status === 401 &&
    !skipRefresh
  ) {
    const refreshed =
      await refreshAccessToken();

    if (!refreshed) {
      throw new ApiError(
        "احراز هویت مورد نیاز است.",
        401,
        null,
        endpoint,
      );
    }

    return apiClient<T>(
      endpoint,
      {
        ...options,
        skipRefresh: true,
      },
    );
  }

  if (!response.ok) {
    const { message, errors } =
      await parseErrorResponse(response);

    throw new ApiError(
      message,
      response.status,
      errors,
      endpoint,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(
      "پاسخ نامعتبر از سرور دریافت شد.",
      response.status,
      null,
      endpoint,
    );
  }
}

