import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

interface LineChartSkeletonProps {
  height?: number;
  lineCount?: number;
}

const LineChartSkeleton: React.FC<LineChartSkeletonProps> = ({
  height = 280,
  lineCount = 1,
}) => {
  const lines = lineCount;

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
      <Box
        sx={{
          flex: 1,
          position: "relative",
          px: 4,
          pb: 3,
        }}
      >
        {/* Grid hint */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(to top, #F1F5F9 0 1px, transparent 1px 40px)",
          }}
        />

        {/* Dots overlay for lines */}
        {Array.from({ length: lines }).map((_, lineIndex) => (
          <Box
            key={lineIndex}
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              px: 4,
              pointerEvents: "none",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="circular"
                animation={SKELETON_ANIMATION}
                width={15}
                height={15}
                sx={{
                  position: "relative",
                  top: `calc(${
                    i === 0
                      ? "26%"
                      : i === 1
                      ? "38%"
                      : i === 2
                      ? "46%"
                      : i === 3
                      ? "54%"
                      : "62%"
                  } + ${lineIndex * 30}px)`,
                }}
              />
            ))}
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          mt: 5,
        }}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            animation={SKELETON_ANIMATION}
            width={120}
            height={14}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LineChartSkeleton;
