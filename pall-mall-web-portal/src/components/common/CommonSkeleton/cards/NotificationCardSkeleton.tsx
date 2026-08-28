import React from "react";
import { Box, Skeleton } from "@mui/material";
import { repeat } from "../utils";
import { SKELETON_ANIMATION } from "../constants";

const NotificationCardSkeleton = () => {
  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: "1px solid #E5E7EB",
        p: 2,
      }}
    >
      {/* DESKTOP */}
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton animation={SKELETON_ANIMATION} variant="circular" width={20} height={20} />
          <Skeleton animation={SKELETON_ANIMATION} variant="text" width={150} height={20} />
          <Skeleton animation={SKELETON_ANIMATION} variant="rounded" width={60} height={22} />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {repeat(3, (i) => (
            <Skeleton key={i} animation={SKELETON_ANIMATION} variant="circular" width={20} height={20} />
          ))}
        </Box>
      </Box>

      {/* MOBILE */}
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          justifyContent: "space-between",
          mt: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton animation={SKELETON_ANIMATION} variant="circular" width={18} height={18} />
          <Skeleton animation={SKELETON_ANIMATION} variant="text" width={120} height={20} />
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton animation={SKELETON_ANIMATION} variant="circular" width={18} height={18} />
          <Skeleton animation={SKELETON_ANIMATION} variant="circular" width={18} height={18} />
        </Box>
      </Box>

      {/* TRIGGER */}
      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
        <Skeleton animation={SKELETON_ANIMATION} variant="text" width={50} height={16} />
        <Skeleton animation={SKELETON_ANIMATION} variant="text" width={120} height={16} />
      </Box>

      {/* CHANNELS */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
        {repeat(3, (i) => (
          <Skeleton key={i} animation={SKELETON_ANIMATION} variant="rounded" width={60} height={22} />
        ))}
      </Box>
    </Box>
  );
};

export default NotificationCardSkeleton;
