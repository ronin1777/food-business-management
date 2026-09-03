import { NextRequest, NextResponse } from "next/server";

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken =
    request.cookies.get("access_token")?.value;

  const isProtectedPath = PROTECTED_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`),
  );

  if (isProtectedPath && !accessToken) {
    return NextResponse.redirect(
      new URL("/login", request.url),
    );
  }

  return NextResponse.next();
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




// proxy.ts
// import { NextRequest, NextResponse } from "next/server";

// // تنها مسیرهایی که بدون احراز هویت هم قابل دسترسی‌اند
// const PUBLIC_PATHS = [
//   "/login",
//   // اگه صفحات عمومی دیگه‌ای دارید (مثلاً ثبت‌نام، فراموشی رمز) اینجا اضافه کنید:
//   // "/register",
//   // "/forgot-password",
// ];

// function isExpired(token: string): boolean {
//   try {
//     const payload = JSON.parse(
//       Buffer.from(token.split(".")[1], "base64").toString("utf-8"),
//     );
//     return Date.now() >= payload.exp * 1000 - 10_000;
//   } catch {
//     return true;
//   }
// }

// async function refreshAccessToken(refreshToken: string): Promise<string | null> {
//   try {
//     const res = await fetch(`${process.env.DJANGO_API_URL}/api/token/refresh/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ refresh: refreshToken }),
//     });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return data.access as string;
//   } catch {
//     return null;
//   }
// }

// export async function proxy(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   const isPublicPath = PUBLIC_PATHS.some(
//     (path) => pathname === path || pathname.startsWith(`${path}/`),
//   );

//   const accessToken = request.cookies.get("access_token")?.value;
//   const refreshToken = request.cookies.get("refresh_token")?.value;

//   let validAccessToken =
//     accessToken && !isExpired(accessToken) ? accessToken : null;

//   if (!validAccessToken && refreshToken) {
//     validAccessToken = await refreshAccessToken(refreshToken);
//   }

//   // حالت ۱: مسیر عمومیه (login) ولی کاربر از قبل لاگینه → بفرستش داشبورد
//   if (isPublicPath) {
//     if (validAccessToken) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }
//     return NextResponse.next();
//   }

//   // حالت ۲: هر مسیر دیگه‌ای (پیش‌فرض: محافظت‌شده) و کاربر احراز هویت نشده
//   if (!validAccessToken) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("next", pathname);
//     const response = NextResponse.redirect(loginUrl);
//     response.cookies.delete("access_token");
//     response.cookies.delete("refresh_token");
//     return response;
//   }

//   // حالت ۳: مسیر محافظت‌شده و کاربر معتبره
//   const response = NextResponse.next();
//   if (validAccessToken !== accessToken) {
//     response.cookies.set("access_token", validAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       path: "/",
//     });
//   }
//   return response;
// }

// export const config = {
//   matcher: [
//     /*
//      * روی همه‌چیز اجرا شو به‌جز:
//      * - فایل‌های استاتیک نکست (_next/static, _next/image)
//      * - favicon و فایل‌های عمومی داخل public/ (تشخیص با وجود پسوند فایل)
//      * - API روت‌های خودتون که ربطی به auth ندارن (اختیاری، اگه لازم شد اضافه کنید)
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
//   ],
// };