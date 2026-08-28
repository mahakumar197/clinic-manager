import { Box, Chip, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CommonIconButton from "./CommonIconButton";
import CommonIcon from "./CommonIcon";

interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  iconBgColor?: string;
  enableBack?: boolean;
  chipStyle?: object;
  batch?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleSx?: object; 
  subtitleSx?: object;
}

const CommonPageHeader = ({
  title,
  subtitle,
  icon,
  iconBgColor,
  enableBack = false,
  batch,
  chipStyle = {},
  titleColor,
  subtitleColor, // default empty
   titleSx, 
  subtitleSx,
}: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const bgColor = iconBgColor ?? theme.palette.primary.main;

  const handleBack = () => navigate(-1);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {/* Back / Custom Icon */}
      {(enableBack || icon) && (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {enableBack ? (
            <CommonIconButton
              icon={<CommonIcon name="ArrowLeft" color="black" size={20} />}
              onClick={handleBack}
            />
          ) : (
            <Box
              sx={{
                bgcolor: bgColor,
                color: "white",
                p: 2,
                borderRadius: "50%",
                width: "35px",
                height: "35px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src={icon}
                alt="icon"
                sx={{ width: 24, height: 24 }}
              />
            </Box>
          )}
        </Box>
      )}

      {/* Title + Subtitle */}
      <Box sx={{ minWidth: 0, overflow: "hidden" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ color: titleColor ?? "text.primary", ...titleSx  }}>
            {title}
          </Typography>
          {batch && (
            <Chip
              label={batch}
              sx={{ height: "22px", fontSize: "12px", ...chipStyle }}
            />
          )}
        </Box>

        {subtitle && (
          <Typography
            variant="subtitle2"
            sx={{ color: subtitleColor ?? "text.secondary", ...subtitleSx  }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default CommonPageHeader;
