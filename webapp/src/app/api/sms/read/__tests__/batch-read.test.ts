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
      updateMany: vi.fn(),
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

describe("PATCH /api/sms/read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when session is absent", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const request = new Request("http://localhost/api/sms/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["1"], isRead: true }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when ids array is empty or missing", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

    const request = new Request("http://localhost/api/sms/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [], isRead: true }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when isRead is not a boolean", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);

    const request = new Request("http://localhost/api/sms/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["1"], isRead: "true" }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it("returns 200 and updates status when payload is valid", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);
    vi.mocked(prisma.smsMessage.updateMany).mockResolvedValueOnce({ count: 2 });

    const request = new Request("http://localhost/api/sms/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["msg-1", "msg-2"], isRead: false }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.count).toBe(2);
    expect(data.isRead).toBe(false);

    expect(prisma.smsMessage.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["msg-1", "msg-2"] } },
      data: { isRead: false },
    });
  });

  it("returns 500 when database update throws an exception", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(mockSession);
    vi.mocked(prisma.smsMessage.updateMany).mockRejectedValueOnce(new Error("DB failure"));

    const request = new Request("http://localhost/api/sms/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: ["msg-1"], isRead: true }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Internal Server Error");
  });
});

