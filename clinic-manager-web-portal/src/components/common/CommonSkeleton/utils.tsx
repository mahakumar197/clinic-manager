// CommonSkeleton/utils.tsx

import React from "react";
import { Box } from "@mui/material";
import { SKELETON_SPACING } from "./constants";

/* -------------------------------------------------------
   repeat() → replaces Array.from({ length }).map
------------------------------------------------------- */
export const repeat = (
  count: number = 1,
  render: (index: number) => React.ReactNode
) => Array.from({ length: count }).map((_, index) => render(index));

/* -------------------------------------------------------
   StackY → vertical spacing wrapper
------------------------------------------------------- */
interface StackYProps {
  gap?: keyof typeof SKELETON_SPACING | number;
  children: React.ReactNode;
}

export const StackY: React.FC<StackYProps> = ({
  gap = "md",
  children,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap:
        typeof gap === "number"
          ? gap
          : SKELETON_SPACING[gap],
    }}
  >
    {children}
  </Box>
);

/* -------------------------------------------------------
   StackX → horizontal spacing wrapper
------------------------------------------------------- */
interface StackXProps {
  gap?: keyof typeof SKELETON_SPACING | number;
  align?: string;
  justify?: string;
  children: React.ReactNode;
}

export const StackX: React.FC<StackXProps> = ({
  gap = "md",
  align = "center",
  justify = "flex-start",
  children,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: align,
      justifyContent: justify,
      gap:
        typeof gap === "number"
          ? gap
          : SKELETON_SPACING[gap],
    }}
  >
    {children}
  </Box>
);

/* -------------------------------------------------------
   Section → common bordered container
------------------------------------------------------- */
interface SectionProps {
  children: React.ReactNode;
  mt?: number;
  mb?: number;
}

export const Section: React.FC<SectionProps> = ({
  children,
  mt = 0,
  mb = 0,
}) => (
  <Box
    sx={{
      mt,
      mb,
    }}
  >
    {children}
  </Box>
);

/* -------------------------------------------------------
   Center → center align content
------------------------------------------------------- */
interface CenterProps {
  children: React.ReactNode;
  minHeight?: number | string;
}

export const Center: React.FC<CenterProps> = ({
  children,
  minHeight,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight,
    }}
  >
    {children}
  </Box>
);

/* -------------------------------------------------------
   FullWidth → force full width block
------------------------------------------------------- */
export const FullWidth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Box sx={{ width: "100%" }}>
    {children}
  </Box>
);
