import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

    const userAgent = request.headers.get("user-agent") || "unknown";
    const path = request.nextUrl.pathname;
    const timestamp = new Date().toISOString();

    console.log(`[VISITOR_LOG] ${timestamp} | IP: ${ip} | Path: ${path} | UA: ${userAgent}`);

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
