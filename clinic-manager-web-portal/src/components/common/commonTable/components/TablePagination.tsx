import { Box, MenuItem, Pagination, PaginationItem, Select, Typography } from "@mui/material";
import CommonIcon from "../../CommonIcon";
import { DropdownIcon } from "@/assets";
import { tablePalette } from "@/theme/tablePalette";
import { PaginationMeta } from "../types";
import { DEFAULT_ROWS_PER_PAGE } from "../constants";

interface TablePaginationProps {
  pageMeta: PaginationMeta;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (limit: number) => void;
}

const CustomPaginationItem = (props: any) => (
  <PaginationItem
    {...props}
    slots={{
      first: () => <CommonIcon name="ChevronsLeft" size={18} />,
      previous: () => <CommonIcon name="ChevronLeft" size={18} />,
      next: () => <CommonIcon name="ChevronRight" size={18} />,
      last: () => <CommonIcon name="ChevronsRight" size={18} />,
    }}
    sx={{
      fontWeight: 600,
      borderRadius: "8px",
      "&.Mui-selected": {
        backgroundColor: "primary.main",
        color: "primary.contrastText",
      },
    }}
  />
);

export const TablePagination = ({ pageMeta, onPageChange, onRowsPerPageChange }: TablePaginationProps) => {
  if (!pageMeta || pageMeta.total <= 1) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderTop: `1px solid ${tablePalette.pagination.contrastText}`,
        backgroundColor: `1px solid ${tablePalette.pagination.dark}`,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Select
          value={pageMeta.limit}
          onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
          variant="standard"
          disableUnderline
          IconComponent={() => (
            <Box
              component="img"
              src={DropdownIcon}
              sx={{
                width: 12,
                height: 12,
                position: "absolute",
                right: 10,
                pointerEvents: "none",
              }}
            />
          )}
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: "text.primary",
            minWidth: 60,
            px: 1,
            py: 0.5,
            border: `1px solid ${tablePalette.pagination.contrastText}`,
            borderRadius: "6px",
            background: "background.paper",
            "& .MuiSelect-select": {
              py: 0.4,
              pr: "25px !important",
            },
          }}
        >
          {DEFAULT_ROWS_PER_PAGE.map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>

        <Typography fontSize={14}>
          Showing{" "}
          <b>
            {(pageMeta.page - 1) * pageMeta.limit + 1}–
            {Math.min(pageMeta.page * pageMeta.limit, pageMeta.total)}
          </b>{" "}
          out of <b>{pageMeta.total}</b> items
        </Typography>
      </Box>
      {/* 
      <Pagination
        count={pageMeta.totalPages}
        page={pageMeta.page}
        onChange={(_, page) => {
          onPageChange?.(page);
          document.querySelector("#common-table-top")?.scrollIntoView({ behavior: "smooth" });
        }}
        showFirstButton
        showLastButton
        siblingCount={0}
        boundaryCount={0}
        renderItem={(item) => {
          if (item.type === "page" && item.page !== pageMeta.page) {
            return null;
          }
          return <CustomPaginationItem {...item} />;
        }}
      /> */}
      <Pagination
        count={pageMeta.totalPages}
        page={pageMeta.page}
        onChange={(_, page) => {
          onPageChange?.(page);
        }}
        showFirstButton
        showLastButton
        siblingCount={0}
        boundaryCount={1}
        renderItem={(item) => <CustomPaginationItem {...item} />}
      />
    </Box>
  );
};



