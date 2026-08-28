import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const MessageCardSkeleton = () => {
  return (
    <Box
      sx={{
        cursor: "default",
        display: "flex",
        justifyContent: "space-between",
        p: 2,
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      {/* LEFT SECTION */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          width: "30%",
        }}
      >
        {/* Avatar */}
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="circular"
          width={40}
          height={40}
        />

        {/* Text Content */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {/* Name */}
          <Skeleton
            animation={SKELETON_ANIMATION}
            variant="text"
            width="30%"
            height={20}
          />

          {/* Subject */}
          <Skeleton
            animation={SKELETON_ANIMATION}
            variant="text"
            width="50%"
            height={16}
          />

          {/* Preview */}
          <Skeleton
            animation={SKELETON_ANIMATION}
            variant="text"
            width="70%"
            height={16}
          />

          {/* Chip / indicator */}
          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="rounded"
              width={60}
              height={20}
            />
          </Box>
        </Box>
      </Box>

      {/* RIGHT SECTION – TIME */}
      <Box sx={{ textAlign: "right" }}>
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width={40}
          height={16}
        />
      </Box>
    </Box>
  );
};

export default MessageCardSkeleton;
