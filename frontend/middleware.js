import { NextResponse } from "next/server";

export const config = {
    matcher: ["/api/:path*"],
};

export function middleware(request) {
    const url = `${server}${request.nextUrl.pathname.replace("https://content.wallstreetlocal.com", "")}${request.nextUrl.search}`
    return NextResponse.rewrite(
        url,
        { request }
    )
};