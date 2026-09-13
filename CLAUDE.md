# CLAUDE.md

Guidance for working in the SMS Monitor repository.

## Project Overview

SMS Monitor has two committed components:

- `app/`: Android Kotlin app that captures SMS and supported messaging notifications and forwards them to a configured HTTP endpoint.
- `webapp/`: Next.js dashboard that authenticates users, stores SMS data in PostgreSQL through Prisma, encrypts sender/content before storage, and displays message history.

Only `:app` is included in `settings.gradle.kts`. Do not treat untracked modules or local experiments as part of the product unless they are deliberately added to the build and schema.

## Android App

- Kotlin with Jetpack Compose
- Gradle version catalog in `gradle/libs.versions.toml`
- Namespace/application ID: `com.vijay.smsmonitor`
- Compile/target SDK: 35; minimum SDK: 24

Message flow:

1. `SmsBroadcastReceiver` receives SMS broadcasts and enqueues `SmsWorker`.
2. `RcsNotificationListenerService` reads supported Google Messages and Samsung Messages notifications and enqueues `SmsWorker`.
3. `SmsWorker` reads the saved webhook URL/API key, sends JSON with an optional `X-API-Key` header, and retries failed network responses through WorkManager.

Important Android files:

- `app/src/main/java/com/vijay/smsmonitor/MainActivity.kt`: configuration UI and permission requests
- `app/src/main/java/com/vijay/smsmonitor/SmsBroadcastReceiver.kt`: SMS receiver
- `app/src/main/java/com/vijay/smsmonitor/RcsNotificationListenerService.kt`: notification-based RCS receiver
- `app/src/main/java/com/vijay/smsmonitor/service/SmsWorker.kt`: forwarding worker
- `app/src/main/AndroidManifest.xml`: permissions and service registration

## Web Dashboard

- Next.js 16 App Router
- Tailwind CSS v4
- PostgreSQL with Prisma ORM
- NextAuth.js v4 with Google OAuth and an `ALLOWED_EMAILS` allowlist
- AES-256-CBC encryption in `webapp/src/lib/encryption.ts`
- Optional Upstash Redis rate limiting

Key routes and components:

- `webapp/src/app/api/sms/route.ts`: API-key-authenticated SMS ingestion endpoint with rate limiting and encryption
- `webapp/src/app/api/sms/[id]/read/route.ts`: authenticated read-status update endpoint
- `webapp/src/app/api/auth/[...nextauth]/route.ts`: NextAuth route
- `webapp/src/middleware.ts`: protects dashboard routes while excluding login, auth, and SMS ingestion routes
- `webapp/src/components/MessageBrowser.tsx`: message browsing, searching, grouping, and read-state UI
- `webapp/src/lib/prisma.ts`: Prisma client access
- `webapp/prisma/schema.prisma`: SMS and NextAuth models

The encryption format is `iv:encrypted_content`, with both parts hex encoded. `ENCRYPTION_KEY` must be a 64-character hexadecimal string. Sender and content are encrypted before being written; the optional receiver value is stored as provided.

Required environment variables include:

- `DATABASE_URL`
- `ENCRYPTION_KEY`
- `SMS_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ALLOWED_EMAILS`
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` when Redis rate limiting is enabled

Keep secrets in local environment files or the ignored `secrets/` directory. Never commit credentials, service-account JSON, API keys, tokens, or runtime logs.

## Commands

Run from the repository root:

```powershell
# Android
.\gradlew.bat :app:assembleDebug
.\gradlew.bat :app:assembleRelease
.\gradlew.bat :app:test
.\gradlew.bat clean
```

Run from `webapp/`:

```powershell
npm install
npm run dev
npm run build
npm run start
npm run lint
npx prisma generate
npx prisma db push
npx prisma migrate dev
npx prisma studio
```

Gradle uses the JDK configured in `gradle.properties`. Keep generated directories such as `app/build/`, `webapp/.next/`, `webapp/out/`, and local logs out of version control.

## Repository Hygiene

Before finishing work:

- Run `git status --short` and inspect every untracked path.
- Remove generated logs, temporary files, token/debug scripts, and abandoned experiments.
- Do not delete product source, migrations, or configuration without checking whether they are tracked and referenced.
- Run the narrowest relevant build, test, lint, or typecheck command after edits.
