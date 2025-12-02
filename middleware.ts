import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";
import { UserRole } from "@/lib/types";

export async function middleware(request: NextRequest) {
  // Skip auth for public routes
  const publicRoutes = ["/api/auth/login", "/api/auth/register"];
  if (
    publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  try {
    const token = extractTokenFromHeader(request.headers.get("authorization") ?? undefined);
    const user = verifyToken(token);

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.userId.toString());
    requestHeaders.set("x-user-email", user.email);
    requestHeaders.set("x-user-role", user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: "/api/:path*",
};
