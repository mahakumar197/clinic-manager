import React from "react";
import { Box, Skeleton, Divider } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const EditNotificationRuleSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER: "Edit Rule" title + delete icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width={100}
          height={28}
        />
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="rounded"
          width={22}
          height={22}
          sx={{ borderRadius: "4px" }}
        />
      </Box>

      {/* RULE NAME INPUT */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="rounded"
        width="100%"
        height={56}
        sx={{ borderRadius: "8px", mb: 2 }}
      />

      {/* NOTIFICATION TRIGGER EVENT DROPDOWN */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="rounded"
        width="100%"
        height={56}
        sx={{ borderRadius: "8px", mb: 2 }}
      />

      {/* NOTIFICATION CHANNELS LABEL */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="text"
        width={180}
        height={22}
        sx={{ mb: 2 }}
      />

      {/* NOTIFICATION CHANNEL ROWS */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            px: 2,
            py: 1.5,
            mb: 1.5,
          }}
        >
          {/* Icon + labels */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="circular"
              width={22}
              height={22}
            />
            <Box>
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={140}
                height={18}
              />
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={110}
                height={14}
              />
            </Box>
          </Box>

          {/* Toggle */}
          <Skeleton
            animation={SKELETON_ANIMATION}
            variant="rounded"
            width={42}
            height={24}
            sx={{ borderRadius: "12px" }}
          />
        </Box>
      ))}

      {/* SELECT RECIPIENTS DROPDOWN */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="rounded"
        width="100%"
        height={56}
        sx={{ borderRadius: "8px", mt: 1, mb: 3 }}
      />

      {/* RULE STATUS ROW */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="text"
          width={90}
          height={22}
        />
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="rounded"
          width={42}
          height={24}
          sx={{ borderRadius: "12px" }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ACTION BUTTONS: Save Changes + Cancel */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="rounded"
          width="60%"
          height={44}
          sx={{ borderRadius: "8px" }}
        />
        <Skeleton
          animation={SKELETON_ANIMATION}
          variant="rounded"
          width="38%"
          height={44}
          sx={{ borderRadius: "8px" }}
        />
      </Box>
    </Box>
  );
};

export default EditNotificationRuleSkeleton;
