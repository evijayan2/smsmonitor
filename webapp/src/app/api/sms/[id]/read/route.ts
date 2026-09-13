import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Updates the read status of an individual SMS message.
 *
 * @param request - HTTP Request, optionally containing JSON body { isRead?: boolean }
 * @param context - Context containing route params with message ID
 * @returns JSON response containing the updated message record
 */
export async function PATCH(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const isRead = typeof body.isRead === "boolean" ? body.isRead : true;

    const message = await prisma.smsMessage.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json(message);
  } catch (error) {
    logger.error("Error updating message read status", { error: String(error) });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
