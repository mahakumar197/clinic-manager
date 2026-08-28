import React from "react";
import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const DoctorNotificationSkeleton = () => {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "14px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        {/* ICON */}
        <Skeleton
          variant="circular"
          animation={SKELETON_ANIMATION}
          width={40}
          height={40}
        />

        {/* CONTENT */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          {/* LEFT CONTENT */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Title */}
            <Skeleton
              variant="text"
              width="20%"
              animation={SKELETON_ANIMATION}
              height={20}
            />

            {/* Description */}
            <Skeleton
              variant="text"
              width="30%"
              animation={SKELETON_ANIMATION}
              height={16}
            />

            {/* Chips */}
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Skeleton
                variant="rounded"
                animation={SKELETON_ANIMATION}
                width={70}
                height={22}
              />
              <Skeleton
                variant="rounded"
                animation={SKELETON_ANIMATION}
                width={70}
                height={22}
              />
            </Box>
          </Box>

          {/* RIGHT ACTIONS */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", sm: "flex-end" },
              gap: 1,
              minWidth: 160,
              flexShrink: 0,
            }}
          >
            {/* Time */}
            <Skeleton variant="text" width={140} height={14} />

            {/* Buttons */}
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Skeleton
                variant="rounded"
                animation={SKELETON_ANIMATION}
                width={90}
                height={32}
              />
              <Skeleton
                variant="rounded"
                animation={SKELETON_ANIMATION}
                width={90}
                height={32}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorNotificationSkeleton;
