import { useState } from "react";
import { Column, SortOrder } from "../types";

export const useTableSort = (onSortChange?: (sortQuery: Record<string, number>) => void) => {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (col: Column) => {
    if (!col.sortKey) return;

    let nextSortOrder: SortOrder = 1;

    if (sortBy === col.id && sortOrder === 1) {
      nextSortOrder = -1;
    } else if (sortBy === col.id && sortOrder === -1) {
      setSortBy(null);
      setSortOrder(null);
      onSortChange?.({});
      return;
    }

    setSortBy(col.id);
    setSortOrder(nextSortOrder);
    onSortChange?.({ [col.sortKey]: nextSortOrder });
  };

  return { sortBy, sortOrder, handleSort };
};