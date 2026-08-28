import React from "react";
import { Box, Grid, Skeleton, Stack } from "@mui/material";
import { repeat } from "../utils";
import { SKELETON_ANIMATION } from "../constants";

interface ProgressSkeletonProps {
  rows?: number;
  columns?: 1 | 2;
}

const ProgressSkeleton: React.FC<ProgressSkeletonProps> = ({
  rows = 3,
  columns = 1,
}) => {
  return (
    <Box>
      {columns === 2 ? (
        <Grid container spacing={3}>
          {repeat(rows, (i) => (
            <Grid key={i} size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  {/* LABEL */}
                  <Skeleton
                    animation={SKELETON_ANIMATION}
                    variant="text"
                    width={140}
                    height={22}
                  />
                  {/* PERCENTAGE */}
                  <Skeleton
                    animation={SKELETON_ANIMATION}
                    variant="text"
                    width={70}
                    height={22}
                  />
                </Stack>

                {/* PROGRESS BAR */}
                <Skeleton
                  animation={SKELETON_ANIMATION}
                  variant="rounded"
                  height={12}
                  sx={{ borderRadius: 8 }}
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Stack spacing={3}>
          {repeat(rows, (i) => (
            <Box key={i}>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                {/* LABEL */}
                <Skeleton
                  animation={SKELETON_ANIMATION}
                  variant="text"
                  width={160}
                  height={22}
                />
                {/* TOTAL FORM / PERCENTAGE */}
                <Skeleton
                  animation={SKELETON_ANIMATION}
                  variant="text"
                  width={90}
                  height={22}
                />
              </Stack>

              {/* PROGRESS BAR */}
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="rounded"
                height={8}
                sx={{ borderRadius: 8 }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ProgressSkeleton;
