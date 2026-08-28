// CommonSkeleton/pages/PatientModalSkeleton.tsx

import React from "react";
import { Box, Skeleton } from "@mui/material";
import AvatarSkeleton from "../base/AvatarSkeleton";
import TextSkeleton from "../base/TextSkeleton";
import { SKELETON_ANIMATION } from "../constants";

const PatientModalSkeleton = () => {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <AvatarSkeleton />
        <Box sx={{ flex: 1 }}>
          <Skeleton animation={SKELETON_ANIMATION} width="40%" />
          <Skeleton animation={SKELETON_ANIMATION} width="60%" />
        </Box>
      </Box>

      <TextSkeleton rows={4} />
    </Box>
  );
};

export default PatientModalSkeleton;
