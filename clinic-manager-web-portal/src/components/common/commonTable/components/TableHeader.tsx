import { Box, TableCell, TableHead, TableRow, TableSortLabel } from "@mui/material";
import CommonIcon from "../../CommonIcon";
import { tablePalette } from "@/theme/tablePalette";
import { Column, SortOrder } from "../types";

interface SortArrowIconProps {
  active: boolean;
  direction: "asc" | "desc";
}

const SortArrowIcon = ({ active, direction }: SortArrowIconProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      color: active ? "#000" : "#9CA3AF",
      transform: direction === "desc" ? "rotate(180deg)" : "none",
      transition: "0.2s ease",
    }}
  >
    <CommonIcon name="ArrowUp" size={16} />
  </Box>
);

interface TableHeaderProps {
  columns: Column[];
  sortBy: string | null;
  sortOrder: SortOrder;
  onSort: (col: Column) => void;
  hideSortIcon?: boolean;
}

export const TableHeader = ({ columns, sortBy, sortOrder, onSort, hideSortIcon = false }: TableHeaderProps) => {
  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: tablePalette.tableTextBackground.header }}>
        {columns.map((col) => (
          <TableCell key={col.id} sx={{ fontWeight: 600 }}>
            {col.sortable ? (
              <TableSortLabel
                hideSortIcon={hideSortIcon}
                active={sortBy === col.id && sortOrder !== null}
                direction={sortOrder === -1 ? "desc" : "asc"}
                onClick={() => onSort(col)}
                IconComponent={() => (
                  <SortArrowIcon
                    active={sortBy === col.id && sortOrder !== null}
                    direction={sortOrder === -1 ? "desc" : "asc"}
                  />
                )}
                sx={{
                  "&.MuiTableSortLabel-root": {
                    color: "inherit",
                  },
                  "&.MuiTableSortLabel-active": {
                    color: "inherit",
                  },
                  "& .MuiTableSortLabel-label": {
                    color: "inherit",
                    fontWeight: "inherit",
                  },
                  "& .MuiTableSortLabel-icon": {
                    opacity: 1,
                    marginLeft: "6px",
                  },
                }}
              >
                {col.label}
              </TableSortLabel>
            ) : (
              col.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};