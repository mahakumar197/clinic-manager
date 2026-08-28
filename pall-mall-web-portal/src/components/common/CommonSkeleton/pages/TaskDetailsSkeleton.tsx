import React from "react";
import { Box, Skeleton } from "@mui/material";
import { repeat } from "../utils";
import { SKELETON_ANIMATION as ANIMATION } from "../constants";

const TaskDetailsSkeleton = () => {
  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: { xs: 3, md: 3 },
          mt: 3,
        }}
      >
        {/* ================= LEFT COLUMN ================= */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Task Details */}
          <Box sx={cardStyle}>
            <Skeleton animation={ANIMATION} variant="text" sx={{ width: { xs: "70%", sm: 140 }, mb: 2 }} height={24} />

            <Skeleton animation={ANIMATION} variant="text" sx={{ width: "100%" }} height={18} />
            <Skeleton animation={ANIMATION} variant="text" width="100%" />
            <Skeleton animation={ANIMATION} variant="text" width="95%" />

            <Divider />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: 2, sm: 3 },
              }}
            >
              {repeat(4, (i) => (
                <Box key={i} sx={{ minWidth: 0 }}>
                  <Skeleton animation={ANIMATION} variant="text" width="100%" />
                  <Skeleton animation={ANIMATION} variant="text" width="70%" />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Comments */}
          <Box sx={cardStyle}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 2 }}>
              <Skeleton animation={ANIMATION} variant="text" sx={{ width: { xs: "100%", sm: 120 } }} height={22} />
              <Skeleton animation={ANIMATION} variant="rounded" width={28} height={24} sx={{ borderRadius: 2 }} />
            </Box>

            {repeat(2, (i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.5, my: 2 }}>
                <Skeleton animation={ANIMATION} variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                    <Skeleton animation={ANIMATION} variant="text" sx={{ width: { xs: "100%", sm: 120 } }} />
                    <Skeleton animation={ANIMATION} variant="rounded" sx={{ width: { xs: "40%", sm: 80 }, borderRadius: 1 }} height={20} />
                    <Skeleton animation={ANIMATION} variant="text" sx={{ width: { xs: "60%", sm: 100 } }} />
                  </Box>
                  <Skeleton animation={ANIMATION} variant="text" width="80%" />
                  <Skeleton animation={ANIMATION} variant="text" width="95%" />
                </Box>
              </Box>
            ))}

            <Divider />

            <Skeleton animation={ANIMATION} variant="rounded" height={96} sx={{ borderRadius: 2, mb: 2 }} />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Skeleton animation={ANIMATION} variant="rounded" height={36} sx={{ flex: 1 }} />
              <Skeleton animation={ANIMATION} variant="rounded" height={36} sx={{ flex: 1 }} />
            </Box>
          </Box>

          {/* Activity */}
          <Box sx={cardStyle}>
            <Skeleton animation={ANIMATION} variant="text" sx={{ width: "60%", mb: 3 }} height={24} />

            {repeat(3, (i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                <Skeleton animation={ANIMATION} variant="circular" width={8} height={8} sx={{ mt: 1 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton animation={ANIMATION} variant="text" width="70%" />
                  <Skeleton animation={ANIMATION} variant="text" width="90%" height={14} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ================= RIGHT COLUMN ================= */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mt: { xs: 4, md: 0 },
            pt: { xs: 3, md: 0 },
            borderTop: { xs: "1px solid #E5E7EB", md: "none" },
          }}
        >
          {/* Status */}
          <Box sx={cardStyle}>
            <Skeleton animation={ANIMATION} variant="text" width="60%" />
            <Skeleton animation={ANIMATION} variant="text" width="80%" />
            <Skeleton animation={ANIMATION} variant="text" width="60%" />
          </Box>

          {/* Assignment */}
          <Box sx={cardStyle}>
            <Skeleton animation={ANIMATION} variant="text" width="70%" sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", gap: 2, p: 2, bgcolor: "#F8FAFC", borderRadius: 2 }}>
              <Skeleton animation={ANIMATION} variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Skeleton animation={ANIMATION} variant="text" width="100%" />
                <Skeleton animation={ANIMATION} variant="text" width="60%" />
              </Box>
            </Box>

            <Skeleton animation={ANIMATION} variant="rounded" height={36} sx={{ mt: 2 }} />
          </Box>

          {/* Key Dates */}
          <Box sx={cardStyle}>
            <Skeleton animation={ANIMATION} variant="text" width="60%" sx={{ mb: 2 }} />

            {repeat(3, (i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Skeleton animation={ANIMATION} variant="circular" width={20} height={20} />
                  <Skeleton animation={ANIMATION} variant="text" width="70%" />
                </Box>
                <Skeleton animation={ANIMATION} variant="text" width="60%" sx={{ ml: 4 }} />
              </Box>
            ))}
          </Box>

          {/* Attachments */}
          <Box sx={cardStyle}>
            {/* <Skeleton animation={ANIMATION} variant="text" width="70%" sx={{ mb: 2 }} /> */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
              <Skeleton animation={ANIMATION} variant="text" sx={{ width: { xs: "70%", sm: 120 } }} height={20} />
              <Skeleton animation={ANIMATION} variant="rounded" width={28} height={22} sx={{ borderRadius: 2 }} />
            </Box>

            {repeat(3, (i) => (
              <Box key={i} sx={{ display: "flex", gap: 2, p: 2, mb: 1.5, border: "1px solid #E5E7EB", borderRadius: 2 ,flexWrap: { xs: "wrap", sm: "nowrap" },}}>
                <Skeleton animation={ANIMATION} variant="rounded" width={40} height={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton animation={ANIMATION} variant="text" width="80%" />
                  <Skeleton animation={ANIMATION} variant="text" width="60%" />
                </Box>
              </Box>
            ))}

            <Skeleton animation={ANIMATION} variant="rounded" height={36} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const cardStyle = {
  p: { xs: 1.5, sm: 2, md: 3 },
  borderRadius: "14px",
  border: "1px solid #E5E7EB",
  bgcolor: "#fff",
};

const Divider = () => <Box sx={{ my: 2, borderBottom: "1px solid #E5E7EB" }} />;

export default TaskDetailsSkeleton;
