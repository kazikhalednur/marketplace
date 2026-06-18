import { NextResponse } from "next/server";

export async function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*", "/employer/:path*", "/admin/:path*"],
};
