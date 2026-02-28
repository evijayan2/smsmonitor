import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export default withAuth(
    function middleware(_req: NextRequest) {
        // Auth is handled by withAuth - authorized users pass through
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    // Protect all routes except auth-related and the SMS ingestion API
    // The SMS ingestion API (/api/sms) is protected by a separate API Key check
    matcher: [
        "/((?!api/auth|api/sms|login|_next/static|_next/image|favicon.ico).*)",
    ],
};
