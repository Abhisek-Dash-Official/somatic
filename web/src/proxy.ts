import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "10 s"),
  analytics: true,
});

export default withAuth(
  async function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isApi = path.startsWith("/api/");

    if (
      path.startsWith("/api/auth") ||
      path.startsWith("/api/system/settings")
    ) {
      return NextResponse.next();
    }

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      if (isApi) {
        return NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          },
        );
      }
      return NextResponse.rewrite(new URL("/too-many-requests", req.url));
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
