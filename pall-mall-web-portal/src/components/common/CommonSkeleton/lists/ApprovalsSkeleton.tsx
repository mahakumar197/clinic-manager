import React from "react";
import { Box, Skeleton } from "@mui/material";
import { repeat } from "../utils";
import { SKELETON_ANIMATION } from "../constants";

interface ApprovalListSkeletonProps {
  rows?: number;
}

const ApprovalListSkeleton: React.FC<ApprovalListSkeletonProps> = ({
  rows = 6,
}) => {
  return (
    <Box>
      {repeat(rows, (i) => (
        <Box
          key={i}
          sx={{
            p: 2.2,
            mb: 2,
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          {/* Name + urgency */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="text"
              width="40%"
              height={20}
            />
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="rounded"
              width={60}
              height={22}
            />
          </Box>

          {/* Form title */}
          <Skeleton
            animation={SKELETON_ANIMATION}
            variant="text"
            width="60%"
            height={16}
          />

          {/* Date */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
          >
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="circular"
              width={16}
              height={16}
            />
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="text"
              width="30%"
              height={14}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default ApprovalListSkeleton;
