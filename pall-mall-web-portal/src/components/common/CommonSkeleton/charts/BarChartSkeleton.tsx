import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION as ANIMATION } from "../constants";

interface BarChartSkeletonProps {
  barCount?: number;
  categoryCount?: number;
  height?: number;
}

const BarChartSkeleton: React.FC<BarChartSkeletonProps> = ({
  barCount = 1,
  categoryCount = 7,
  height = 320,
}) => {
  const isSingleBar = barCount === 1;

  const getBarHeight = (groupIndex: number) => {
    switch (groupIndex) {
      case 0:
        return "78%";
      case 1:
        return "66%";
      case 2:
        return "72%";
      case 3:
        return "58%";
      case 4:
        return "63%";
      case 5:
        return "49%";
      default:
        return "42%";
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Chart area */}
      <Box sx={{ flex: 1, display: "flex" }}>
        <Box
          sx={{
            height: "100%",
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: isSingleBar ? "space-evenly" : "space-between",
            px: isSingleBar ? 0 : 3,
            pb: 2,
          }}
        >
          {Array.from({ length: categoryCount }).map((_, groupIndex) => (
            <Box
              key={groupIndex}
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-end",
                height: "100%",
              }}
            >
              {Array.from({ length: barCount }).map((_, barIndex) => (
                <Skeleton
                  key={barIndex}
                  animation={ANIMATION}
                  variant="rounded"
                  width={isSingleBar ? 56 : 45}
                  height={getBarHeight(groupIndex)}
                  sx={{ borderRadius: "8px 8px 0 0" }}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend skeleton */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          mt: 2,
        }}
      >
        {Array.from({ length: barCount }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            width={120}
            height={14}
            animation={ANIMATION}
          />
        ))}
      </Box>
    </Box>
  );
};

export default BarChartSkeleton;
