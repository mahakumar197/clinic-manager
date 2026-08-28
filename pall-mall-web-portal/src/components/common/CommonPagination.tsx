import CommonIcon from "@/components/common/CommonIcon";
import {
  Box,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  Typography,
} from "@mui/material";

/* ----------------------------------
 * Types
 * ---------------------------------- */
interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CommonPaginationProps {
  pageMeta: PageMeta;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (limit: number) => void;
}

/* ----------------------------------
 * Custom Pagination Item
 * (Icons + Active style)
 * ---------------------------------- */
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
      minWidth: 36,
      height: 36,
      "&.Mui-selected": {
        backgroundColor: "primary.main",
        color: "primary.contrastText",
      },
    }}
  />
);

/* ----------------------------------
 * CommonPagination Component
 * ---------------------------------- */
const CommonPagination = ({
  pageMeta,
  onPageChange,
  onRowsPerPageChange,
}: CommonPaginationProps) => {
  /* ----------------------------------
   * Do not render if pagination not needed
   * ---------------------------------- */

  if (!pageMeta || pageMeta.total <= 10) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* ----------------------------------
       * Left Section (Rows + Info)
       * ---------------------------------- */}
      <Box
        sx={{
          display: {
            xs: "none",
            sm: "none",
            md: "flex",
          },
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Rows per page */}
        <Select
          value={pageMeta.limit}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          variant="standard"
          disableUnderline
          sx={{
            fontSize: 14,
            fontWeight: 600,
            minWidth: 60,
            px: 1,
            py: 0.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "6px",
            backgroundColor: "background.paper",
          }}
        >
          {[10, 20, 50].map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>

        {/* Showing text */}
        <Typography fontSize={14}>
          Showing{" "}
          <b>
            {(pageMeta.page - 1) * pageMeta.limit + 1}–
            {Math.min(pageMeta.page * pageMeta.limit, pageMeta.total)}
          </b>{" "}
          out of <b>{pageMeta.total}</b> items
        </Typography>
      </Box>

      {/* ----------------------------------
       * Right Section (Pagination)
       * ---------------------------------- */}
      <Pagination
        count={pageMeta.totalPages}
        page={pageMeta.page}
        onChange={(_, page) => onPageChange(page)}
        showFirstButton
        showLastButton
        siblingCount={0}
        boundaryCount={0}
        renderItem={(item) => {
          // Show only active page number
          if (item.type === "page" && item.page !== pageMeta.page) {
            return null;
          }

          return <CustomPaginationItem {...item} />;
        }}
      />
    </Box>
  );
};

export default CommonPagination;
