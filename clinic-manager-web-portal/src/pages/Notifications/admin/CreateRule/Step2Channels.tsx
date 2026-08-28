// Step2Channels.tsx
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { Controller } from "react-hook-form";
import { ToggleSwitch, CommonIcon } from "@/components/common";

interface Props {
  form: any;
}

const Step2Channels = ({ form }: Props) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="button" sx={{ mb: 0.5 }}>
        Notification Channels
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          p: { xs: 0.5, sm: 1 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {/* In-App */}
        <Controller
          name="channelInApp"
          control={form.control}
          render={({ field }) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: { xs: 1.5, sm: 1.5 },
                borderRadius: "8px",
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, alignItems: "flex-start", flex: 1, minWidth: 0,}}>
                <Box sx={{ flexShrink: 0, mt: 0.3 }}>
                <CommonIcon
                  name="Bell"
                  size={20}
                  color={theme.palette.text.secondary}
                />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 500,
                    }}
                  >
                    In-App Notification
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      lineHeight: 1.4,
                    }}
                  >
                    Show alert banner in the portal
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flexShrink: 0 }}>
              <ToggleSwitch
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              </Box>
            </Box>
          )}
        />

        {/* Email */}
        <Controller
          name="channelEmail"
          control={form.control}
          render={({ field }) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: { xs: 1.5, sm: 1.5 },
                borderRadius: "8px",
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Box 
                sx={{ 
                  display: "flex", 
                  gap: { xs: 1.5, sm: 2 }, 
                  alignItems: "flex-start", 
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Box sx={{ flexShrink: 0, mt: 0.3 }}> 
                <CommonIcon
                  name="Mail"
                  size={20}
                  color={theme.palette.text.secondary}
                />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body1"
                    sx={{ 
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 500,
                    }}
                  >
                    Email Notification
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      lineHeight: 1.4,
                    }}
                  >
                    Send immediate email alert
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flexShrink: 0 }}>
              <ToggleSwitch
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              </Box>
            </Box>
          )}
        />

        {/* Digest */}
        <Controller
          name="channelDigest"
          control={form.control}
          render={({ field }) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: { xs: 1.5, sm: 1.5 },
                borderRadius: "8px",
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Box 
                sx={{ 
                  display: "flex", 
                  gap: { xs: 1.5, sm: 2 }, 
                  alignItems: "flex-start", 
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Box sx={{ flexShrink: 0, mt: 0.3 }}>
                <CommonIcon
                  name="Clock4"
                  size={20}
                  color={theme.palette.text.secondary}
                />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      fontWeight: 500,
                    }}
                  >
                    Daily Digest
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      lineHeight: 1.4,
                    }}
                  >
                    Include in daily summary email
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flexShrink: 0 }}>
              <ToggleSwitch
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              </Box>
            </Box>
          )}
        />
      </Paper>
    </Box>
  );
};

export default Step2Channels;


