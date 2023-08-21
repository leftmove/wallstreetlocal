import { NextResponse } from "next/server";

export const config = {
  matcher: ["/api/:path*"],
};

export function middleware(request) {
  const server = process.env.BACKEND_SERVER_URL;
  const url = `${server}${request.nextUrl.pathname.replace("/api", "")}${request.nextUrl.search}`
  return NextResponse.rewrite(
    url,
    { request }
  )
};