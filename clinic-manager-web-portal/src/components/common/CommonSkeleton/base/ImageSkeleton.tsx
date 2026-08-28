import React from "react";
import { Skeleton } from "@mui/material";
import {
  SKELETON_ANIMATION,
  SKELETON_SIZES,
} from "../constants";

interface ImageSkeletonProps {
  width?: number | string;
  height?: number;
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  width = "100%",
  height = SKELETON_SIZES.image.md,
}) => {
  return (
    <Skeleton
      animation={SKELETON_ANIMATION}
      variant="rectangular"
      width={width}
      height={height}
    />
  );
};

export default ImageSkeleton;
