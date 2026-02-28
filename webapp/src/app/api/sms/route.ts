import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";

export async function POST(request: Request) {
    console.log("POST /api/sms request received");
    try {
        // 1. API Key Authentication
        const apiKey = request.headers.get("X-API-Key");
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
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
