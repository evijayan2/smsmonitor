import { describe, it, expect } from "vitest";
import {
  toggleSelection,
  selectAll,
  deselectAll,
  selectUnread,
  isAllSelected,
  isIndeterminateSelection,
} from "../selection";

describe("selection utilities", () => {
  const sampleItems = [
    { id: "msg-1", isRead: false },
    { id: "msg-2", isRead: true },
    { id: "msg-3", isRead: false },
  ];

  it("should add item if not present in set", () => {
    const initial = new Set<string>(["msg-1"]);
    const result = toggleSelection(initial, "msg-2");
    expect(result.has("msg-2")).toBe(true);
    expect(result.size).toBe(2);
  });

  it("should remove item if already present in set", () => {
    const initial = new Set<string>(["msg-1", "msg-2"]);
    const result = toggleSelection(initial, "msg-1");
    expect(result.has("msg-1")).toBe(false);
    expect(result.size).toBe(1);
  });

  it("should select all items from an array", () => {
    const result = selectAll(sampleItems);
    expect(result.size).toBe(3);
    expect(result.has("msg-1")).toBe(true);
    expect(result.has("msg-2")).toBe(true);
    expect(result.has("msg-3")).toBe(true);
  });

  it("should deselect all items", () => {
    const result = deselectAll();
    expect(result.size).toBe(0);
  });

  it("should select only unread items", () => {
    const result = selectUnread(sampleItems);
    expect(result.size).toBe(2);
    expect(result.has("msg-1")).toBe(true);
    expect(result.has("msg-2")).toBe(false);
    expect(result.has("msg-3")).toBe(true);
  });

  it("should evaluate isAllSelected correctly", () => {
    expect(isAllSelected(3, 3)).toBe(true);
    expect(isAllSelected(3, 2)).toBe(false);
    expect(isAllSelected(0, 0)).toBe(false);
  });

  it("should evaluate isIndeterminateSelection correctly", () => {
    expect(isIndeterminateSelection(3, 1)).toBe(true);
    expect(isIndeterminateSelection(3, 2)).toBe(true);
    expect(isIndeterminateSelection(3, 3)).toBe(false);
    expect(isIndeterminateSelection(3, 0)).toBe(false);
  });
});

