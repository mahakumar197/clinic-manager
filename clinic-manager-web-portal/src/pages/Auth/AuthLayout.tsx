import {
  AuthLogo,
  AuthNotePad,
  AuthSearch,
  LoginBackground,
  AuthBackIcon,
} from "@/assets";
import AuthBackground from "@/assets/images/backgrounds/auth-bg.svg";

import {
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AuthLayout = ({
  children,
  showBackButton = true,
}: {
  children: React.ReactNode;
  showBackButton?: boolean;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const isBelowMd = useMediaQuery(theme.breakpoints.down("md")); // <900

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        flexDirection: isBelowMd ? "column" : "row",
      }}
    >
      {/* LEFT SECTION */}
      <Box
        sx={{
          width: isBelowMd ? "100%" : "45%",
          height: "100%",
          position: "relative",
          backgroundColor: "primary.main",
            backgroundImage: `url("${AuthBackground}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: isBelowMd ? "1400px" : "1500px",
          backgroundPosition: "bottom center",
          backgroundPositionY: isBelowMd ? "140px" : "200px",
          overflow: "visible",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            position: "absolute",
            top: isBelowMd ? 20 : 40,
            right: isBelowMd ? 20 : 40,
            zIndex: 4,
          }}
        >
          <Box
            component="img"
            src={AuthLogo}
            alt="Pall Mall Logo"
            sx={{
              width: isBelowMd ? 120 : 140,
              height: "auto",
            }}
          />
        </Box>

        {/* Doctors Image - hidden below md */}
        {!isBelowMd && (
          <Box
            component="img"
            src={LoginBackground}
            alt="Doctors"
            sx={{
              position: "absolute",
              bottom: "-35px",
              left: "-20px",
              width: "115%",
              height: "auto",
              zIndex: 3,
            }}
          />
        )}

        {/* Cards hidden below md */}
        {!isBelowMd && (
          <Box
            sx={{
              position: "absolute",
              top: "30%",
              left: "5%",
              width: "320px",
              display: "flex",
              alignItems: "center",
              gap: 2,
              backdropFilter: "blur(12px)",
              background: "rgba(0, 0, 0, 0.47)",
              boxShadow: "0px 5.94px 11.89px 0px rgba(84, 185, 237, 0.1)",
              borderRadius: "12px",
              color: "#fff",
              px: 3,
              py: 2,
              zIndex: 5,
              textWrap: "nowrap",
            }}
          >
            <Box
              component="img"
              src={AuthSearch}
              sx={{ width: 32, height: 32 }}
            />
            <Box>
              <Typography variant="h6">Well qualified doctors</Typography>
              <Typography sx={{ opacity: 0.6 }} variant="body1">
                Treat with atmost care
              </Typography>
            </Box>
          </Box>
        )}

        {!isBelowMd && (
          <Box
            sx={{
              position: "absolute",
              bottom: "10%",
              left: "30%",
              width: "300px",
              display: "flex",
              alignItems: "center",
              gap: 2,
              backdropFilter: "blur(12px)",
              background: "rgba(0, 0, 0, 0.47)",
              boxShadow: "0px 5.94px 11.89px 0px rgba(84, 185, 237, 0.1)",
              borderRadius: "12px",
              color: "#fff",
              px: 3,
              py: 2,
              zIndex: 5,
              textWrap: "nowrap",
            }}
          >
            <Box
              component="img"
              src={AuthNotePad}
              sx={{ width: 32, height: 32 }}
            />
            <Box>
              <Typography variant="h6">Track your progress</Typography>
              <Typography variant="body1" sx={{ opacity: 0.6 }}>
                Call/text/video/inperson
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* RIGHT SECTION */}
      <Box
        sx={{
          width: isBelowMd ? "100%" : "55%",
          height: isBelowMd ? "50%" : "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isBelowMd ? "transparent" : "#fff",
          p: isBelowMd ? 2 : 6,
          position: isBelowMd ? "absolute" : "relative",
          top: isBelowMd ? "230px" : "auto",
          zIndex: 15,
        }}
      >
        {/* BACK ARROW BUTTON */}
        {showBackButton && (
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="Go Back"
            sx={{
              position: "absolute",
              top: 40,
              left: 40,
              width: 44,
              height: 44,
              display: isBelowMd ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": { opacity: 0.8 },
            }}
          >
            <Box
              component="img"
              src={AuthBackIcon}
              alt="Back"
              sx={{
                width: 34,
                height: 34,
              }}
            />
          </IconButton>
        )}

        <Box
          sx={{
            width: "100%",
            maxWidth: 490,
            ...(isBelowMd && {
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              background: "rgba(255, 255, 255, 0.18)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.35)",
              boxShadow: "0px 5.94px 11.89px 0px rgba(84, 185, 237, 0.1)",
              padding: theme.spacing(4, 3),
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
