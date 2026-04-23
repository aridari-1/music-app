import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 🔐 PROTECTED ROUTES
  const protectedRoutes = [
    "/dashboard",
    "/artist",
    "/buyer",
    "/upload",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🔐 AUTH ROUTES
  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/sign-up");

  // ❌ NOT LOGGED IN → BLOCK PROTECTED
  if (isProtected && !user) {
    const url = new URL("/auth/login", request.url);
    return NextResponse.redirect(url);
  }

  // ✅ LOGGED IN → BLOCK AUTH PAGES
  if (isAuthPage && user) {
    const url = new URL("/dashboard/buyer", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/artist/:path*",
    "/buyer/:path*",
    "/upload/:path*",
    "/auth/login",
    "/auth/sign-up",
  ],
};