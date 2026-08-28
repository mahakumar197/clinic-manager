import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const EscalationCardSkeleton = () => {
  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: "1px solid #E5E7EB",
        p: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton animation={SKELETON_ANIMATION} variant="circular" width={20} height={20} />
          <Skeleton animation={SKELETON_ANIMATION} variant="text" width={180} height={20} />
          <Skeleton animation={SKELETON_ANIMATION} variant="rounded" width={60} height={22} />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton animation={SKELETON_ANIMATION} variant="circular" width={20} height={20} />
          <Skeleton animation={SKELETON_ANIMATION} variant="circular" width={20} height={20} />
          <Skeleton animation={SKELETON_ANIMATION} variant="circular" width={20} height={20} />
        </Box>
      </Box>

      {/* If */}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Skeleton animation={SKELETON_ANIMATION} variant="text" width={30} height={16} />
        <Skeleton animation={SKELETON_ANIMATION} variant="text" width={200} height={16} />
      </Box>

      {/* Then */}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Skeleton animation={SKELETON_ANIMATION} variant="text" width={40} height={16} />
        <Skeleton variant="text" width={180} height={16} />
      </Box>

      {/* Channels */}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Skeleton animation={SKELETON_ANIMATION} variant="rounded" width={70} height={22} />
        <Skeleton animation={SKELETON_ANIMATION} variant="rounded" width={80} height={22} />
      </Box>
    </Box>
  );
};

export default EscalationCardSkeleton;
