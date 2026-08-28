import { Box, Skeleton } from "@mui/material";
import { SKELETON_ANIMATION } from "../constants";

const AvatarTextSkeleton = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Avatar */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="circular"
        width={40}
        height={40}
      />

      {/* Text */}
      <Skeleton
        animation={SKELETON_ANIMATION}
        variant="text"
        width={150}
        height={24}
      />
    </Box>
  );
};

export default AvatarTextSkeleton;
