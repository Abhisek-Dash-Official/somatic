import { withAuth } from "next-auth/middleware";

import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isApi = path.startsWith("/api/");

    if (path.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    const rejectAccess = (status: number, message: string) => {
      if (isApi) {
        return NextResponse.json({ error: message }, { status });
      }
      return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    };

    if (!token) {
      return rejectAccess(401, "Unauthorized access. Please login.");
    }

    if (
      (path.startsWith("/admin") || path.startsWith("/api/admin")) &&
      token.role !== "admin"
    ) {
      return rejectAccess(403, "Forbidden: Admin access required");
    }

    if (
      (path.startsWith("/doctor") || path.startsWith("/api/doctor")) &&
      token.role !== "doctor"
    ) {
      return rejectAccess(403, "Forbidden: Doctor access required");
    }

    if (
      (path.startsWith("/patient") || path.startsWith("/api/patient")) &&
      token.role !== "patient"
    ) {
      return rejectAccess(403, "Forbidden: Patient access required");
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/doctor/:path*",
    "/patient/:path*",
    "/api/:path*",
  ],
};
