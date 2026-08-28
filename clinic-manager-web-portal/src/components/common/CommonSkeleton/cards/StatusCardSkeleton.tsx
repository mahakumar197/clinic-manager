import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const StatusCardSkeleton = () => {
  return (
    <Box
      sx={{
        mt: 1,
        backgroundColor: "background.paper", // ✅ added
        borderRadius: "10px",
        border: "1px solid",
        borderColor: "divider",
        px: "17px",
        py: "17px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        width: "100%", // ✅ added
      }}
    >
      {/* Icon skeleton */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="circular"
        width={40}
        height={40}
      />

      {/* Text skeletons */}
      <Box sx={{ flex: 1 }}>
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width="20%"
          height={22}
        />
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width="70%"
          height={18}
        />
      </Box>
    </Box>
  );
};

export default StatusCardSkeleton;
