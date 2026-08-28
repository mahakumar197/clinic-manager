import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const ContentImageLibrarySkeleton = () => {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #eee",
        backgroundColor: "#fff",
      }}
    >
      {/* Image */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="rectangular"
        width="100%"
        height={180}
      />

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Title */}
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width="60%"
          height={28}
          sx={{ mb: 0.5 }}
        />

        {/* Description */}
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width="80%"
          height={20}
        />

        {/* Footer */}
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
            width={80}
          />
          <Skeleton
            animation={SKELETON_ANIMATION}
            variant="text"
            width={70}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ContentImageLibrarySkeleton;
