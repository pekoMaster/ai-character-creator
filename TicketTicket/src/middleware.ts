import { auth } from "@/auth";
import { NextResponse } from "next/server";

// 公開路由（不需要登入）
const publicRoutes = [
  "/login",
  "/api/auth",
  "/legal",
  "/_next",
  "/favicon.ico",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 檢查是否為公開路由
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route) || pathname === "/"
  );

  // 檢查是否為靜態檔案
  const isStaticFile = pathname.includes(".") && !pathname.endsWith(".html");

  // 如果是公開路由或靜態檔案，允許通過
  if (isPublicRoute || isStaticFile) {
    return NextResponse.next();
  }

  // 如果用戶未登入，重導向到登入頁面
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // 匹配所有路由，但排除 API routes、_next/static、_next/image、favicon.ico
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
