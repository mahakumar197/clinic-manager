import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

interface PieChartSkeletonProps {
  height?: number; // optional height override
}

const PieChartSkeleton: React.FC<PieChartSkeletonProps> = ({ height }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: height || 280,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Outer ring */}
      <Skeleton
        variant="circular"
        animation={SKELETON_ANIMATION}
        width={200}
        height={200}
      />

      {/* Inner cutout (to fake donut feel) */}
      <Box
        sx={{
          position: "absolute",
          width: 110,
          height: 110,
          backgroundColor: "#fff",
          borderRadius: "50%",
        }}
      />
    </Box>
  );
};

export default PieChartSkeleton;
