
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not configured.",
  );
}

const PROTECTED_PATHS = [
  "/dashboard",
  "/customers",
  "/ingredients",
  "/inventory",
  "/orders",
  "/products",
  "/purchases",
  "/recipes",
  "/reports",
  "/suppliers",
];

const REFRESH_ENDPOINT = "/api/auth/refresh/";

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
  );
}

function isTokenExpired(token: string) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(
      Buffer.from(
        parts[1],
        "base64url",
      ).toString("utf-8"),
    );

    if (typeof payload.exp !== "number") {
      return true;
    }

    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const response = await fetch(
      `${API_URL}${REFRESH_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const setCookie = response.headers.get(
      "set-cookie",
    );

    if (!setCookie) {
      return null;
    }

    const match = setCookie.match(
      /(?:^|,\s*)access_token=([^;]+)/,
    );

    if (!match) {
      return null;
    }

    return match[1];
  } catch (error) {
    console.error(
      "Access token refresh failed:",
      error,
    );

    return null;
  }
}

export async function proxy(
  request: NextRequest,
) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken =
    request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  if (!isTokenExpired(accessToken)) {
    return NextResponse.next();
  }

  const refreshToken =
    request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    const response =
      NextResponse.redirect(
        new URL("/login", request.url),
      );

    response.cookies.delete({
      name: "access_token",
      path: "/",
    });

    response.cookies.delete({
      name: "refresh_token",
      path: "/",
    });

    return response;
  }

  const newAccessToken =
    await refreshAccessToken(refreshToken);

  if (!newAccessToken) {
    const response =
      NextResponse.redirect(
        new URL("/login", request.url),
      );

    response.cookies.delete({
      name: "access_token",
      path: "/",
    });

    response.cookies.delete({
      name: "refresh_token",
      path: "/",
    });

    response.cookies.delete({
      name: "refresh_token",
      path: "/api/auth/",
    });

    return response;
  }

  /*
   * مهم:
   * توکن جدید را روی request هم قرار می‌دهیم
   * تا Server Component در همین request
   * بتواند آن را ببیند.
   */
  request.cookies.set(
    "access_token",
    newAccessToken,
  );

  const response =
    NextResponse.next({
      request,
    });

  /*
   * توکن جدید را روی response هم قرار می‌دهیم
   * تا Browser آن را ذخیره کند.
   */
  response.cookies.set({
    name: "access_token",
    value: newAccessToken,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/ingredients/:path*",
    "/inventory/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/purchases/:path*",
    "/recipes/:path*",
    "/reports/:path*",
    "/suppliers/:path*",
  ],
};
