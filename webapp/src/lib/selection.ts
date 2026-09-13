/**
 * Toggles a single item ID in a set of selected IDs.
 *
 * @param current - Current set of selected item IDs
 * @param id - Item ID to toggle
 * @returns A new Set containing the updated selection
 */
export function toggleSelection(current: Set<string>, id: string): Set<string> {
  const next = new Set(current);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

/**
 * Selects all provided items by their IDs.
 *
 * @param items - Array of items with id property
 * @returns A new Set with all item IDs
 */
export function selectAll<T extends { id: string }>(items: T[]): Set<string> {
  return new Set(items.map((item) => item.id));
}

/**
 * Clears all selections.
 *
 * @returns An empty Set of item IDs
 */
export function deselectAll(): Set<string> {
  return new Set<string>();
}

/**
 * Selects only the unread items from a given list.
 *
 * @param items - Array of items with id and isRead properties
 * @returns A new Set containing IDs of unread items
 */
export function selectUnread<T extends { id: string; isRead?: boolean }>(items: T[]): Set<string> {
  const unreadItems = items.filter((item) => !item.isRead);
  return new Set(unreadItems.map((item) => item.id));
}

/**
 * Determines whether all items are currently selected.
 *
 * @param totalCount - Total number of available items
 * @param selectedCount - Number of currently selected items
 * @returns True if all items are selected and totalCount > 0
 */
export function isAllSelected(totalCount: number, selectedCount: number): boolean {
  if (totalCount === 0) return false;
  return selectedCount >= totalCount;
}

/**
 * Determines whether selection is in an indeterminate state.
 *
 * @param totalCount - Total number of available items
 * @param selectedCount - Number of currently selected items
 * @returns True if some, but not all, items are selected
 */
export function isIndeterminateSelection(totalCount: number, selectedCount: number): boolean {
  return selectedCount > 0 && selectedCount < totalCount;
}

