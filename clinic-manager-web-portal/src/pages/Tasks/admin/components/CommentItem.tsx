import { Avatar, Box, Chip, Typography, useTheme } from "@mui/material";
import { getInitials, convertToCamelCase } from "@/utils";
import dayjs from "dayjs";
import { DATE_FORMATS } from "@/constants";
import { tablePalette } from "@/theme/tablePalette";

const CommentItem = ({ c }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "#FEF3C6",
              color: tablePalette.tableText.pending,
              fontSize: theme.typography.caption.fontSize,
              fontWeight: theme.typography.caption.fontWeight,
            }}
          >
            {getInitials(c?.commentedByUser?.userName || "")}
          </Avatar>
    
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.5,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body1">
                {c?.commentedByUser?.userName}
              </Typography>
              <Typography variant="overline" sx={{ borderRadius: "8px" }}>
                <Chip
                  label={convertToCamelCase(c?.commentedByUser?.role)}
                  size="small"
                  sx={{
                    fontSize: theme.typography.caption.fontSize,
                    backgroundColor: "#F1F5F9",
                    color: "text.secondary",
                    px: 0.5,
                    textTransform: "none",
                  }}
                />
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {dayjs(c.commented_at).format(DATE_FORMATS.DATE_TIME)}
              </Typography>
            </Box>
    
            <Typography variant="body2" sx={{ color: "#314158" }}>
              {c?.attachment?.filename || ""}
              {c?.attachment?.filename && c?.comment && " - "}
              {c?.comment || ""}
            </Typography>
          </Box>
        </Box>
  );
};

export default CommentItem;
