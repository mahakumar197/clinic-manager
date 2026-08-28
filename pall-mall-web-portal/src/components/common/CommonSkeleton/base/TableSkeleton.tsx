import React from "react";
import { Skeleton } from "@mui/material";
import { repeat } from "../utils";
import { SKELETON_ANIMATION } from "../constants";

interface TableSkeletonProps {
  rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
}) => {
  return (
    <>
      {repeat(rows, (i) => (
        <Skeleton
          key={i}
          animation={SKELETON_ANIMATION}
          variant="rectangular"
          width="100%"
          height={40}
          sx={{ mb: 1 }}
        />
      ))}
    </>
  );
};

export default TableSkeleton;
