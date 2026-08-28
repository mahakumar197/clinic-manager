import React from "react";
import { Box, Skeleton } from "@mui/material";
import { repeat } from "../utils";
import { SKELETON_ANIMATION } from "../constants";

interface PatientListSkeletonProps {
  rows?: number;
}

const PatientListSkeleton: React.FC<PatientListSkeletonProps> = ({
  rows = 5,
}) => {
  return (
    <Box>
      {repeat(rows, (i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderRadius: 2,
            border: "1px solid #eee",
            mb: 1,
          }}
        >
          {/* LEFT SIDE */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Avatar */}
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="circular"
              width={40}
              height={40}
            />

            {/* Text */}
            <Box>
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={140}
                height={20}
              />
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={80}
                height={16}
              />
            </Box>
          </Box>

          {/* RIGHT SIDE BADGE / BUTTON */}
          <Skeleton
            animation={SKELETON_ANIMATION}
            variant="rounded"
            width={48}
            height={24}
          />
        </Box>
      ))}
    </Box>
  );
};

export default PatientListSkeleton;
