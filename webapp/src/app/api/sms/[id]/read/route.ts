import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
        }

        const message = await prisma.smsMessage.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("Error marking message as read:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
