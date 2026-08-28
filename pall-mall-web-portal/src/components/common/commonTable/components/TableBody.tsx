import {
  TableBody as MuiTableBody,
  TableCell,
  TableRow,
  Typography,
  useTheme,
  Box,
} from "@mui/material";
import { tablePalette } from "@/theme/tablePalette";
import { EmptyStateLoader } from "../..";
import { Column } from "../types";
import { getCellSkeleton } from "./TableSkeleton";
import {
  PatientCell,
  SurgeryCell,
  AvatarCell,
  RoleCell,
  StatusCell,
  PhaseCell,
  TwoFACell,
  DueDateCell,
} from "./TableCells";
import { ActionMenu } from "./ActionMenu";
import { formatDateTime } from "@/utils/helpers";
import { noData } from "@/assets";

interface TableBodyProps<T> {
  columns: Column[];
  data: T[];
  loading: boolean;
  isEmpty: boolean;
  title: string;
  onViewClick?: (row: T) => void;
}

export const TableBody = <T extends { id: string | number }>({
  columns,
  data,
  loading,
  isEmpty,
  title,
  onViewClick,
}: TableBodyProps<T>) => {
  const theme = useTheme();

  if (loading) {
    return (
      <MuiTableBody>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((col) => (
              <TableCell key={col.id}>{getCellSkeleton(col)}</TableCell>
            ))}
          </TableRow>
        ))}
      </MuiTableBody>
    );
  }

  if (isEmpty) {
    return (
      <MuiTableBody>
        <TableRow>
          <TableCell
            colSpan={columns.length}
            sx={{ p: 2, borderBottom: "none" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
                py: 4,
              }}
            >
              <Box
                component="img"
                src={noData}
                alt="No messages"
                sx={{
                  width: { xs: 100, sm: 160 },
                  height: "auto",
                  mb: 1,
                }}
              />
              <Typography variant="body1" fontWeight={600} color="secondary.contrastText">
                No Data
              </Typography>
              {/* <EmptyStateLoader title={title} subtitle="No Data Available" /> */}
            </Box>
          </TableCell>
        </TableRow>
      </MuiTableBody>
    );
  }

  return (
    <MuiTableBody>
      {data.map((row) => (
        <TableRow
          key={row.id}
          sx={{
            "&:hover": {
              background: tablePalette.tableTextBackground.header,
            },
          }}
        >
          {columns.map((col) => {
            const value = row[col.id as keyof T];

            if (col.patient) {
              return (
                <TableCell key={col.id}>
                  <PatientCell row={row} col={col} />
                </TableCell>
              );
            }

            if (col.surgery) {
              return (
                <TableCell key={col.id}>
                  <SurgeryCell row={row} col={col} />
                </TableCell>
              );
            }

            if (col.render) {
              return (
                <TableCell key={col.id}>
                  {col.render(value, row, col)}
                </TableCell>
              );
            }

            if (col.avatar) {
              return (
                <TableCell key={col.id}>
                  <AvatarCell row={row} col={col} />
                </TableCell>
              );
            }

            if (col.id === "roleLabel" || col.id === "role") {
              return (
                <TableCell key={col.id}>
                  <RoleCell value={value} />
                </TableCell>
              );
            }

            if (col.id === "status" && col.color) {
              return (
                <TableCell key={col.id}>
                  <StatusCell value={value} />
                </TableCell>
              );
            }

            if (col.id === "phase") {
              return (
                <TableCell key={col.id}>
                  <PhaseCell value={value} isColored={col.color === true} />
                </TableCell>
              );
            }

            if (col.id.toLowerCase() === "twofa") {
              return (
                <TableCell key={col.id}>
                  <TwoFACell value={value} />
                </TableCell>
              );
            }

            if (col.id === "actions") {
              if (col.actionType === "view") {
                return (
                  <TableCell key={col.id}>
                    <Typography
                      sx={{
                        color: "primary.main",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                      onClick={() => onViewClick?.(row)}
                    >
                      View
                    </Typography>
                  </TableCell>
                );
              }

              if (col.actionType === "menu") {
                return (
                  <TableCell key={col.id}>
                    <ActionMenu col={col} row={row} />
                  </TableCell>
                );
              }

              return <TableCell key={col.id} />;
            }

            if (col.id === "lastLogin") {
              return (
                <TableCell
                  key={col.id}
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: theme.typography.body2.fontWeight,
                  }}
                >
                  {formatDateTime(String(value))}
                </TableCell>
              );
            }

            if (col.id === "due_date") {
              return (
                <TableCell key={col.id}>
                  <DueDateCell value={String(value)} />
                </TableCell>
              );
            }

            if (col.id === "lastUpdate") {
              return (
                <TableCell
                  key={col.id}
                  sx={{ whiteSpace: "nowrap", fontSize: 13, fontWeight: 500 }}
                >
                  {String(value)}
                </TableCell>
              );
            }

            if (col.textColor) {
              return (
                <TableCell key={col.id} sx={{ color: col.textColor }}>
                  {String(value)}
                </TableCell>
              );
            }

            return (
              <TableCell key={col.id}>
                {!value || value === "null" || value === "undefined"
                  ? "-"
                  : String(value)}
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </MuiTableBody>
  );
};
