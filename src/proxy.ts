import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();

  if (process.env.NODE_ENV !== "production") {
    response.headers.set(
      "Clear-Site-Data",
      '"cache", "storage", "executionContexts"'
    );
    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  return response;
}

export const config = {
  matcher: "/:path*",
};
