import React from "react";
import { Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

interface AvatarSkeletonProps {
  height?: number;
  width?: number;
}

const AvatarSkeleton: React.FC<AvatarSkeletonProps> = ({
  height = 40,
  width,
}) => {
  const size = width || height;

  return (
    <Skeleton
      animation={SKELETON_ANIMATION}
      variant="circular"
      width={size}
      height={size}
    />
  );
};

export default AvatarSkeleton;
