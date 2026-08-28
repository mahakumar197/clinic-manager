import React from "react";
import { Skeleton } from "@mui/material";
import { repeat } from "../utils";
import {
  SKELETON_ANIMATION,
  SKELETON_SIZES,
} from "../constants";

interface TextSkeletonProps {
  rows?: number;
  width?: number | string;
  height?: number;
}

const TextSkeleton: React.FC<TextSkeletonProps> = ({
  rows = 1,
  width = "100%",
  height = SKELETON_SIZES.text.md,
}) => {
  return (
    <>
      {repeat(rows, (i) => (
        <Skeleton
          key={i}
          animation={SKELETON_ANIMATION}
          variant="text"
          width={width}
          height={height}
          sx={{ mb: 1 }}
        />
      ))}
    </>
  );
};

export default TextSkeleton;
