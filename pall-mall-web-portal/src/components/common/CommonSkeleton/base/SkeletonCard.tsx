import { Box } from "@mui/material";

const SkeletonCard = ({ children }) => (
  <Box
    sx={{
      p: 3,
      borderRadius: "14px",
      border: "1px solid #E5E7EB",
      bgcolor: "#fff",
    }}
  >
    {children}
  </Box>
);

export default SkeletonCard;
