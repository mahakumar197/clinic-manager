import { Avatar, Box, Chip, Typography } from "@mui/material";
import { tablePalette } from "@/theme/tablePalette";
import CommonIcon from "../../CommonIcon";
import { Column } from "../types";
import { ROLE_COLORS, STATUS_COLORS, TWO_FA_COLORS } from "../constants";
import { buildChipStyles, getInitials, normalizeValue } from "../utils";
import { capitalize } from "@/utils";

export const PatientCell = ({ row, col }: { row: any; col: Column }) => {
  const name = row[col.patientNameKey || col.id] || "-";
  const id = row[col.patientIdKey || "patientId"] || "-";
  const avatarUrl = row[col.patientAvatarKey || "avatar"];
  const initials = getInitials(name);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar
        src={avatarUrl}
        sx={{
          width: 36,
          height: 36,
          bgcolor: tablePalette.pagination.light,
          color: tablePalette.pagination.main,
          fontWeight: 400,
          fontSize: 14,
        }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography sx={{ fontWeight: 400 }}>{name}</Typography>
        <Typography sx={{ fontWeight: 400, fontSize: 14, color: "text.secondary" }}>
          {id}
        </Typography>
      </Box>
    </Box>
  );
};

export const SurgeryCell = ({ row, col }: { row: any; col: Column }) => {
  const type = row[col.surgeryNameKey || col.id] || "-";
  const date = row[col.surgeryDateKey || "date"] || "-";

  return (
    <Box>
      <Typography sx={{ fontWeight: 400 }}>{type}</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {date}
      </Typography>
    </Box>
  );
};

export const DueDateCell = ({ value }: { value: string }) => {
  if (!value || value === "null") return <Typography>-</Typography>;
  return (
    <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
      {value}
    </Typography>
  );
};

export const AvatarCell = ({ row, col }: { row: any; col: Column }) => {
  const name = row[col.avatarNameKey || col.id] || "-";
  const email = row[col.avatarEmailKey || "email"];
  const initials = row[col.avatarInitialKey || "initials"] || String(name).substring(0, 2).toUpperCase();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: tablePalette.pagination.light,
          color: tablePalette.pagination.main,
          fontSize: 14,
        }}
      >
        {initials}
      </Avatar>
      <Box>
        <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
        {email && (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {email}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export const RoleCell = ({ value }: { value: any }) => {
  if (!value || value === "null") return <Typography>-</Typography>;
  const normalized = normalizeValue(value);
  const style = ROLE_COLORS[normalized] || {
    bg: "background.paper",
    color: "text.primary",
    border: tablePalette.pagination.contrastText,
  };

  return (
    <Chip
      label={capitalize(value) as string}
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 600,
        borderRadius: "8px",
        height: "22px",
        fontSize: "12px",
      }}
    />
  );
};

export const StatusCell = ({ value }: { value: any }) => {
  if (!value || value === "null") return <Typography>-</Typography>;
  const normalized = normalizeValue(value);
  const style = STATUS_COLORS[normalized] || {
    bg: tablePalette.tableTextBackground.recovery,
    color: tablePalette.tableText.manager,
    border: tablePalette.tableTextBordercolor.inprogress,
  };

  return <Chip label={capitalize(value) as string} sx={buildChipStyles(style)} />;
};

export const PhaseCell = ({ value, isColored }: { value: any; isColored: boolean }) => {
  if (!value || value === "null") return <Typography>-</Typography>;
  return (
    <Chip
      label={String(value)}
      sx={{
        backgroundColor: isColored ? tablePalette.tableTextBackground.recovery : "background.paper",
        color: isColored ? tablePalette.tableText.manager : "text.primary",
        borderRadius: isColored ? "16px" : "8px",
        border: `1px solid ${
          isColored ? tablePalette.tableTextBordercolor.inprogress : tablePalette.pagination.contrastText
        }`,
        fontWeight: isColored ? 600 : 500,
        height: "22px",
        fontSize: "12px",
        padding: isColored ? "4px 10px" : "0 8px",
      }}
    />
  );
};

export const TwoFACell = ({ value }: { value: any }) => {
  if (!value || value === "null") return <Typography>-</Typography>;
  const normalized = normalizeValue(value);
  const style = TWO_FA_COLORS[normalized] || {
    bg: "background.paper",
    color: "text.primary",
    border: tablePalette.pagination.contrastText,
    icon: "ShieldAlert" as const,
  };

  return (
    <Chip
      icon={<CommonIcon name={style.icon} size={16} color={style.color} />}
      label={value as string}
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 600,
        borderRadius: "8px",
        height: "24px",
        fontSize: "12px",
        pl: "6px",
        textTransform: "capitalize",
      }}
    />
  );
};