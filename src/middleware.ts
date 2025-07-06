
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Route group → expected role
const routeGroups = {
  "/student": "student",
  "/employer": "employer",
  "/admin": "admin",
};

// Your JWT secret (use .env in real project)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Match the path group
  for (const path in routeGroups) {
    if (pathname.startsWith(path)) {
      const token = request.cookies.get("accessToken")?.value;

      if (!token) {
        // Not authenticated → redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }

      try {
        // Verify JWT
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userRole = payload.role;

        // Check if role matches route
        if (userRole !== routeGroups[path as keyof typeof routeGroups]) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      } catch (error) {
        console.error("JWT verification failed:", error);
        // Invalid token → redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/employer/:path*", "/admin/:path*"],
};
