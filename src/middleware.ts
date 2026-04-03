import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "genesis-token";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getTokenPayload(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; role: string; email: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const user = await getTokenPayload(request);

  // Protect /dashboard — require auth
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect /admin — require auth + admin role
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard/orders", request.url));
  }

  // Pass user info to server components via headers
  const response = NextResponse.next();
  if (user) {
    response.headers.set("x-user-id", user.sub);
    response.headers.set("x-user-role", user.role);
    response.headers.set("x-user-email", user.email);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
