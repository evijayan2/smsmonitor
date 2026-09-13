import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { BatchReadRequest, BatchReadResponse } from "@/types/sms";

/**
 * Validates whether the incoming payload conforms to BatchReadRequest.
 *
 * @param body - Unknown body payload from JSON parsing
 * @returns Validated BatchReadRequest or null if invalid
 */
function validateBatchReadPayload(body: unknown): BatchReadRequest | null {
  if (!body || typeof body !== "object") return null;
  const candidate = body as Record<string, unknown>;
  const { ids, isRead } = candidate;

  if (!Array.isArray(ids) || ids.length === 0) return null;
  if (!ids.every((id) => typeof id === "string" && id.trim().length > 0)) {
    return null;
  }
  if (typeof isRead !== "boolean") return null;

  return { ids, isRead };
}

/**
 * Handles batch update of read/unread status for multiple SMS messages.
 *
 * @param request - HTTP Request containing JSON body { ids: string[], isRead: boolean }
 * @returns JSON response with success status and count of updated rows
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const payload = validateBatchReadPayload(body);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid payload: non-empty 'ids' array and boolean 'isRead' required" },
        { status: 400 }
      );
    }

    const result = await prisma.smsMessage.updateMany({
      where: { id: { in: payload.ids } },
      data: { isRead: payload.isRead },
    });

    logger.info("Batch read status updated", { count: result.count, isRead: payload.isRead });
    const response: BatchReadResponse = {
      success: true,
      count: result.count,
      isRead: payload.isRead,
    };
    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error updating batch read status", { error: String(error) });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

