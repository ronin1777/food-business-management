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

  constructor(
    message: string,
    status: number,
    errors: unknown = null,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
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
  const errorBody: Partial<ApiErrorResponse> | null =
    await response
      .json()
      .catch(() => null);

  return {
    message:
      errorBody?.message ??
      `API request failed with status ${response.status}`,
    errors: errorBody?.errors ?? null,
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

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...fetchOptions,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    },
  );

  if (
    response.status === 401 &&
    !skipRefresh
  ) {
    const refreshed =
      await refreshAccessToken();

    if (!refreshed) {
      throw new ApiError(
        "Authentication required.",
        401,
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
    );
  }

  return response.json();
}