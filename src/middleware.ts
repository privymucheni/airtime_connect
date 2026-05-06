import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage =
            req.nextUrl.pathname.startsWith("/login") ||
            req.nextUrl.pathname.startsWith("/register") ||
            req.nextUrl.pathname.startsWith("/register-admin");

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL("/", req.url));
            }
            return null;
        }

        if (!isAuth) {
            if (isAuthPage) return null;
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Role-based protection
        const role = token.role;
        const status = token.status;

        if (status === "SUSPENDED") {
            return NextResponse.redirect(new URL("/login?error=account_suspended", req.url));
        }

        if (req.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/company", req.url));
        }
        if (req.nextUrl.pathname.startsWith("/company") && role !== "COMPANY") {
            return NextResponse.redirect(new URL("/admin", req.url));
        }

        return null;
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const isAuthPage =
                    req.nextUrl.pathname.startsWith("/login") ||
                    req.nextUrl.pathname.startsWith("/register") ||
                    req.nextUrl.pathname.startsWith("/register-admin");
                if (isAuthPage) return true;
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/company/:path*", "/login", "/register", "/register-admin"],
};
