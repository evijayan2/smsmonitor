import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configure rate limiter: max 100 requests per minute per API key
const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(100, "1m"),
        analytics: true,
    })
    : null;

// In-memory fallback rate limiter for development
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkInMemoryRateLimit(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100;

    const record = requestCounts.get(identifier);
    if (!record || now > record.resetTime) {
        // Reset or new window
        requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
        return { success: true, limit: maxRequests, remaining: maxRequests - 1, reset: now + windowMs };
    }

    if (record.count >= maxRequests) {
        return { success: false, limit: maxRequests, remaining: 0, reset: record.resetTime };
    }

    record.count++;
    return { success: true, limit: maxRequests, remaining: maxRequests - record.count, reset: record.resetTime };
}

export async function POST(request: Request) {
    console.log("POST /api/sms request received");

    try {
        // 1. Rate Limiting
        const apiKey = request.headers.get("X-API-Key");
        const identifier = apiKey || request.headers.get("X-Forwarded-For") || "anonymous";

        let rateLimitResult;
        if (ratelimit) {
            rateLimitResult = await ratelimit.limit(identifier);
        } else {
            rateLimitResult = checkInMemoryRateLimit(identifier);
        }

        if (!rateLimitResult.success) {
            console.warn("Rate limit exceeded for:", identifier);
            return NextResponse.json(
                { error: "Too Many Requests", retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000) },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": String(rateLimitResult.limit),
                        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
                        "X-RateLimit-Reset": String(Math.ceil(rateLimitResult.reset / 1000)),
                    },
                }
            );
        }

        // 2. API Key Authentication
        const validApiKey = process.env.SMS_API_KEY;

        if (!apiKey || apiKey !== validApiKey) {
            console.warn("Unauthorized API access attempt");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { sender, content, receiver, timestamp } = body;

        if (!sender || !content) {
            return NextResponse.json(
                { error: "Missing required fields: sender, content" },
                { status: 400 }
            );
        }

        const encryptedSender = encrypt(sender);
        const encryptedContent = encrypt(content);

        const message = await prisma.smsMessage.create({
            data: {
                sender: encryptedSender,
                content: encryptedContent,
                receiver, // Receiver is usually a fixed number, but could be encrypted if needed
                timestamp: timestamp ? new Date(timestamp) : new Date(),
            },
        });

        console.log("Message saved successfully:", message.id);
        return NextResponse.json({ success: true, id: message.id }, { status: 201 });
    } catch (error: any) {
        console.error("CRITICAL error storing SMS:", error.message, error.stack);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
