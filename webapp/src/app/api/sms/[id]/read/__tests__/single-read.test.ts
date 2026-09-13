import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";
import { PATCH } from "../route";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    smsMessage: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockSession: Session = {
  user: { email: "test@example.com", name: "Test User" },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const mockMessage = {
  id: "msg-1",
  sender: "Sender",
  receiver: null,
  content: "Content",
  timestamp: new Date(),
  receivedAt: new Date(),
  isRead: true,
};

describe("PATCH /api/sms/[id]/read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/sms/msg-1/read", {
      method: "PATCH",
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "msg-1" }),
    });

    expect(response.status).toBe(401);
  });

  it("updates message isRead to true by default", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);
    vi.mocked(prisma.smsMessage.update).mockResolvedValueOnce(mockMessage);

    const request = new Request("http://localhost/api/sms/msg-1/read", {
      method: "PATCH",
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "msg-1" }),
    });

    expect(response.status).toBe(200);
    expect(prisma.smsMessage.update).toHaveBeenCalledWith({
      where: { id: "msg-1" },
      data: { isRead: true },
    });
  });

  it("updates message isRead to false when specified", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);
    vi.mocked(prisma.smsMessage.update).mockResolvedValueOnce({
      ...mockMessage,
      isRead: false,
    });

    const request = new Request("http://localhost/api/sms/msg-1/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: false }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "msg-1" }),
    });

    expect(response.status).toBe(200);
    expect(prisma.smsMessage.update).toHaveBeenCalledWith({
      where: { id: "msg-1" },
      data: { isRead: false },
    });
  });
});

