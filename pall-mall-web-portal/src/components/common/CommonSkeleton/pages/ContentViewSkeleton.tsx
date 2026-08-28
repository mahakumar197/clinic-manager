import React from "react";
import { Box, Skeleton, Divider } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const ContentViewSkeleton = () => {
  return (
    <Box sx={{ flex: 1, overflowY: "auto" }}>
      {/* TOP TYPE CHIP */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="rounded"
        width={110}
        height={26}
        sx={{
          borderRadius: "10px",
          mb: 2,
        }}
      />

      {/* TITLE */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="text"
        width="60%"
        height={32}
        sx={{ mb: 2 }}
      />

      {/* MEDIA */}
      <Box
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
          mb: 3,
          border: "1px solid #E5E7EB",
          backgroundColor: "#F8FAFC",
        }}
      >
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="rectangular"
          width="100%"
          height={260}
        />
      </Box>

      {/* STATUS + DATE */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="rounded"
          width={80}
          height={22}
          sx={{ borderRadius: "8px" }}
        />
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width={120}
          height={16}
        />
      </Box>

      {/* CONTENT BODY */}
      <Box sx={{ mb: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={i}
            animation={SKELETON_ANIMATION}
            variant="text"
            width={i === 4 ? "60%" : "100%"}
            height={18}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* ACTION BUTTONS */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="rounded"
          width={90}
          height={36}
          sx={{ borderRadius: "8px" }}
        />
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="rounded"
          width={90}
          height={36}
          sx={{ borderRadius: "8px" }}
        />
      </Box>
    </Box>
  );
};

export default ContentViewSkeleton;
