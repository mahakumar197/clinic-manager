// CommonSkeleton/cards/CardSkeleton.tsx

import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

interface CardSkeletonProps {
  withSubtitle?: boolean;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  withSubtitle = false,
}) => {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="text"
        width="45%"
        height={20}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width="25%"
          height={36}
        />
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="circular"
          width={45}
          height={45}
        />
      </Box>

      {withSubtitle && (
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width="60%"
          height={18}
        />
      )}
    </Box>
  );
};

export default CardSkeleton;
