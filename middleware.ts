import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
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