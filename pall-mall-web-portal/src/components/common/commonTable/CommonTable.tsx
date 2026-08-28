import { Box, Table, TableContainer, TableBody as MuiTableBody, TableRow, TableCell, LinearProgress } from "@mui/material";
import { tablePalette } from "@/theme/tablePalette";
import { CommonTableProps } from "./types";
import { useTableSort } from "./hooks/useTableSort";
import { TableHeader } from "./components/TableHeader";
import { TableBody } from "./components/TableBody";
import { TablePagination } from "./components/TablePagination";
import TopProgressBar from "../TopProgressBar";

const CommonTable = <T extends { id: string | number }>({
  columns,
  data,
  onViewClick,
  pageMeta,
  scrollHeight,
  onPageChange,
  onRowsPerPageChange,
  title = "",
  loading = false,
  isFetching = false,
  onSortChange,
}: CommonTableProps<T>) => {
  const { sortBy, sortOrder, handleSort } = useTableSort(onSortChange);
  const isEmpty = !Array.isArray(data) || data.length === 0;

  const showProgressBar = isFetching && !loading;

  return (
    <Box
      sx={{
        border: `1px solid ${tablePalette.pagination.contrastText}`,
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <TableContainer
        id="common-table-top"
        sx={{
          ...(scrollHeight && {
            maxHeight: scrollHeight,
            overflowY: "auto",
          }),
           overflowX: "auto",
           scrollbarWidth: "thin",
           "&::-webkit-scrollbar": {
            //  display: "none",
            height: "6px", 
           },
        }}
      >
        <Table
          stickyHeader
          sx={{
            "& .MuiTableCell-head": {
              backgroundColor: "tableTextBackground.header",
              position: "sticky",
              top: 0,
              zIndex: 10,
            },
            "& .MuiTableCell-root": {
              borderBottom: `1px solid ${tablePalette.pagination.contrastText}`,
            },
          }}
        >
          <TableHeader columns={columns} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} hideSortIcon={isEmpty}/>

          {/* Progress bar row — sits right below the header */}
          {/* <MuiTableBody> */}
            <TableRow>
              <TableCell
                colSpan={columns.length}
                sx={{
                  p: 0,
                  border: "none",
                  height: 0,
                  lineHeight: 0,
                  position: "relative",
                  zIndex: 10,
                }}
              >
                <Box
                  sx={{
                    // height: showProgressBar ? "3px" : 0,
                    overflow: "hidden",
                    // transition: "height 0.2s ease",
                  }}
                >
                  <TopProgressBar loading={showProgressBar} />
                </Box>
              </TableCell>
            </TableRow>
          {/* </MuiTableBody> */}

          <TableBody
            columns={columns}
            data={data}
            loading={loading}
            isEmpty={isEmpty}
            title={title}
            onViewClick={onViewClick}
          />
        </Table>
      </TableContainer>

      <TablePagination pageMeta={pageMeta} onPageChange={onPageChange} onRowsPerPageChange={onRowsPerPageChange} />
    </Box>
  );
};

export default CommonTable;