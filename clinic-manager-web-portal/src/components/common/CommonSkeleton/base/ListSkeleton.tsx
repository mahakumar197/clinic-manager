import React from "react";
import { Box, Skeleton } from "@mui/material";
import { repeat } from "../utils";
import {
  SKELETON_ANIMATION,
  SKELETON_SIZES,
} from "../constants";

interface ListSkeletonProps {
  rows?: number;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({
  rows = 3,
}) => {
  return (
    <>
      {repeat(rows, (i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Skeleton
            animation={SKELETON_ANIMATION}
            variant="circular"
            width={SKELETON_SIZES.avatar.md}
            height={SKELETON_SIZES.avatar.md}
          />

          <Box sx={{ ml: 2, flex: 1 }}>
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="text"
              width="90%"
            />
            <Skeleton
              animation={SKELETON_ANIMATION}
              variant="text"
              width="60%"
            />
          </Box>
        </Box>
      ))}
    </>
  );
};

export default ListSkeleton;
