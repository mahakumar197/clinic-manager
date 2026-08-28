import { Box } from "@mui/material";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { Column } from "../types";

export const getCellSkeleton = (col: Column) => {
  // Patient column (avatar + 2 text lines)
  if (col.patient) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <CommonSkeleton type="avatarText" />
        <Box sx={{ flex: 1 }}>
          <CommonSkeleton type="text" rows={2} />
        </Box>
      </Box>
    );
  }

  // Avatar column (avatar + name/email)
  if (col.avatar) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <CommonSkeleton type="avatarText" />
        <Box sx={{ flex: 1 }}>
          <CommonSkeleton type="text" rows={2} />
        </Box>
      </Box>
    );
  }

  // Surgery / procedure (two-line text)
  if (col.surgery) {
    return <CommonSkeleton type="text" rows={2} />;
  }

  // Status / badge / pill
  if (col.color) {
    return <CommonSkeleton type="text" width={80} height={24} />;
  }

  // Actions (view / menu / dots)
  if (col.actionType && col.actionType !== "none") {
    return <CommonSkeleton type="text" width={32} />;
  }

  // Custom render (fallback – unknown UI)
  if (col.render) {
    return <CommonSkeleton type="text" rows={1} />;
  }

  // Default → simple text
  return <CommonSkeleton type="text" rows={1} />;
};