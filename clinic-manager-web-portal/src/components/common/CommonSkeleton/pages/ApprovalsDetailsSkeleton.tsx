import React from "react";
import { Box, Grid, Skeleton, Divider } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const ApprovalDetailsSkeleton = () => {
  return (
    <Box sx={{ height: "100%", overflowY: "auto" }}>
      {/* SECTION 1 */}
      <Box
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Skeleton
              animation={SKELETON_ANIMATION}
              width={120}
              height={20}
            />
            <Skeleton
              animation={SKELETON_ANIMATION}
              width={120}
              height={16}
            />
            <Skeleton
              animation={SKELETON_ANIMATION}
              width={120}
              height={16}
            />
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Skeleton
              animation={SKELETON_ANIMATION}
              width={90}
              height={22}
            />
            <Skeleton
              animation={SKELETON_ANIMATION}
              width={120}
              height={36}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Assign To */}
        <Skeleton
          animation={SKELETON_ANIMATION}
          width="50%"
          height={48}
        />

        {/* Summary */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, md: 6 }}>
              <Skeleton
                animation={SKELETON_ANIMATION}
                width="40%"
                height={14}
              />
              <Skeleton
                animation={SKELETON_ANIMATION}
                width="70%"
                height={18}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Conditional */}
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, md: 6 }}>
              <Skeleton
                animation={SKELETON_ANIMATION}
                width="50%"
                height={14}
              />
              <Skeleton
                animation={SKELETON_ANIMATION}
                width="80%"
                height={18}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Warning */}
        <Skeleton
          animation={SKELETON_ANIMATION}
          width="100%"
          height={44}
        />
      </Box>

      {/* COMMENTS */}
      <Box
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Skeleton
          animation={SKELETON_ANIMATION}
          width="30%"
          height={18}
        />

        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              animation={SKELETON_ANIMATION}
              width={100}
              height={32}
            />
          ))}
        </Box>

        <Skeleton
          animation={SKELETON_ANIMATION}
          height={100}
          sx={{ mt: 2 }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Skeleton
            animation={SKELETON_ANIMATION}
            width={120}
            height={36}
          />
        </Box>
      </Box>

      {/* ACTION BUTTONS */}
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Skeleton
              animation={SKELETON_ANIMATION}
              height={44}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Skeleton
              animation={SKELETON_ANIMATION}
              height={44}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ApprovalDetailsSkeleton;
