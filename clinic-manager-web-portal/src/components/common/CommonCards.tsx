import React from "react";
import { Card, Box, Typography, useTheme } from "@mui/material";
import CommonIcon from "./CommonIcon";
// import CommonSkeleton from "./CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";

const hexToRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface CommonCardsProps {
  title: string;
  value: string | number;
  iconName: string;
  // color: keyof typeof colorMap;
  variant: string;
  subtitle?: string;
   loading?: boolean;
}

const CommonCards: React.FC<CommonCardsProps> = ({
  title,
  value,
  iconName,
  variant,
  subtitle,
   loading = false,
}) => {
  const theme = useTheme();

   if (loading) {
    return (
      <CommonSkeleton
        type="card"
        withSubtitle={Boolean(subtitle)}
      />
    );
  }

  const colorMap: any = {
    //COMMTENTED COLORS ARE FROM FIGMA
    orange: {
      // bg: "#FFFBEB",
      bg: theme.palette.primary.light,
      // title: "#BB4D00",
      // value: "#E17100",
      title: theme.palette.warning.main,
      value: theme.palette.warning.main,
      borderColor: "#FEE685",
    },

    blue: {
      bg: "#EFF6FF",
      title: "#1447E6",
      value: "#1C398E",
      borderColor: "#BEDBFF",
    },

    red: {
      // bg: "#FEF2F2",
      bg: theme.palette.error.light,
      // title: "#C10007",
      // value: "#82181A",
      title: theme.palette.error.main,
      value: theme.palette.error.dark,
      borderColor: "#FFC9C9",
    },

    green: {
      bg: "#F0FDF4",
      // bg: theme.palette.success.light,
      // title: "#008236",
      title: theme.palette.success.main,
      // value: "#0D542B",
      value: theme.palette.success.dark,
      borderColor: "#B9F8CF",
    },

    white: {
      // bg: "#FFFFFF",
      bg: theme.palette.background.paper,
      // title: "#45556C",
      // value: "#0F172B",
      title: theme.palette.text.secondary,
      value: theme.palette.text.primary,
      borderColor: "#0000001A",
    },
    lighterGreen: {
      bg: "#F0FDF4",
      title: "#45556C",
      value: "#0F172B",
      borderColor: "#B9F8CF",
    },
  };
  const colors = colorMap[variant] ?? colorMap.white;

  // Main value/icon color
  const mainColor = colors.value;

  // Auto-generate icon background tint
  // const iconBg = tintColor(mainColor, 0.85);
  const iconBg = hexToRGBA(mainColor, 0.1);

  return (
    <Card
      sx={{
        p: theme.spacing(3),
        backgroundColor: colors.bg,
        borderRadius: theme.spacing(1.5),
        border: `1px solid ${colors.borderColor}`,
        boxShadow: "none",
        width: "100%",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: theme.spacing(0.3),
        boxSizing: "border-box",
      }}
    >
      {/* TITLE */}
      <Typography variant="button" color={colors.title}>
        {title}
      </Typography>

      {/* VALUE + ICON */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" color={colors.value}>
          {value}
        </Typography>

        <Box
          sx={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            backgroundColor: iconBg,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CommonIcon name={iconName as any} size={24} color={mainColor} />
        </Box>
      </Box>

      {/* SUBTITLE */}
      {subtitle && (
        <Box display="flex" alignItems="center" gap={0.6}>
          {/* Arrow icon if contains % */}
          {subtitle.includes("%") && (
            <CommonIcon
              name={
                subtitle.trim().startsWith("-") ? "TrendingDown" : "TrendingUp"
              }
              size={14}
              color={
                subtitle.trim().startsWith("-")
                  ? theme.palette.error.main
                  : theme.palette.success.main
              }
            />
          )}

          <Typography
            variant="body2"
            color={
              subtitle.includes("%")
                ? subtitle.trim().startsWith("-")
                  ? theme.palette.error.main
                  : theme.palette.success.main
                : theme.palette.text.secondary
            }
          >
            {subtitle}
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default CommonCards;
