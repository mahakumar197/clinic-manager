import React from "react";
import { Box, Grid, Skeleton, Stack } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const EditUserSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* ===== MAIN GRID ===== */}
      <Grid container spacing={3}>
        {/* ================= LEFT COLUMN ================= */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* -------- Basic Information -------- */}
            <Box
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={140}
                height={22}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6 }}>
                    <Skeleton
                      animation={SKELETON_ANIMATION}
                      variant="rounded"
                      height={48}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* -------- Security Settings -------- */}
            <Box
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={160}
                height={22}
                sx={{ mb: 2 }}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Skeleton
                  animation={SKELETON_ANIMATION}
                  variant="text"
                  width={220}
                />
                <Skeleton
                  animation={SKELETON_ANIMATION}
                  variant="rounded"
                  width={40}
                  height={22}
                />
              </Box>

              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="rounded"
                width={200}
                height={36}
              />
            </Box>

            {/* -------- Notes -------- */}
            <Box
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={140}
                height={22}
                sx={{ mb: 2 }}
              />
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="rounded"
                height={120}
              />
            </Box>
          </Stack>
        </Grid>

        {/* ================= RIGHT COLUMN ================= */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* -------- User Preview -------- */}
            <Box
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                textAlign: "center",
              }}
            >
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="circular"
                width={72}
                height={72}
                sx={{ mx: "auto", mb: 2 }}
              />

              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={160}
                sx={{ mx: "auto" }}
              />
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={200}
                sx={{ mx: "auto" }}
              />

              <Box sx={{ mt: 2 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Skeleton
                      animation={SKELETON_ANIMATION}
                      variant="text"
                      width={80}
                    />
                    <Skeleton
                      animation={SKELETON_ANIMATION}
                      variant="text"
                      width={100}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* -------- Activity Summary -------- */}
            <Box
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
              }}
            >
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={160}
                height={22}
                sx={{ mb: 2 }}
              />

              {Array.from({ length: 3 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Skeleton
                    animation={SKELETON_ANIMATION}
                    variant="text"
                    width={120}
                  />
                  <Skeleton
                    animation={SKELETON_ANIMATION}
                    variant="text"
                    width={80}
                  />
                </Box>
              ))}
            </Box>

            {/* -------- Danger Zone -------- */}
            <Box
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #FCA5A5",
                backgroundColor: "#FEF2F2",
              }}
            >
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="text"
                width={140}
                height={22}
                sx={{ mb: 2 }}
              />
              <Skeleton
                animation={SKELETON_ANIMATION}
                variant="rounded"
                width={180}
                height={36}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditUserSkeleton;
