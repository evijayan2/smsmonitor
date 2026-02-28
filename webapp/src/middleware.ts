import { withAuth } from "next-auth/middleware";

export const middleware = withAuth();

export const config = {
    // Protect all routes except auth-related and the SMS ingestion API
    // The SMS ingestion API (/api/sms) is protected by a separate API Key check
    matcher: [
        "/((?!api/auth|api/sms|login|_next/static|_next/image|favicon.ico).*)",
    ],
};
