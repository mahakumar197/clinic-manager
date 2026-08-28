// Step1ContentType.tsx
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import { Controller } from "react-hook-form";
import type { ContentType } from "./ContentSchema";
import CommonIcon from "@/components/common/CommonIcon";
import { LucideIconName } from "@/components/common/lucideIcons";

interface Props {
  form: any;
}

const CONTENT_TYPES: {
  id: ContentType;
  label: string;
  description: string;
  formats: string;
  iconName: string;
}[] = [
  {
    id: "image",
    label: "Image",
    description: "Before/after photos, diagrams",
    formats: "JPG, PNG, WebP",
    iconName: "Image",
  },
  {
    id: "video",
    label: "Video",
    description: "Educational videos, procedures",
    formats: "MP4, MOV, WebM, URL",
    iconName: "Video",
  },
  {
    id: "blog",
    label: "Blog Article",
    description: "Written content, guides, and tutorials",
    formats: "PDF, DOCX, MD",
    iconName: "FileText",
  },
  {
    id: "elearning",
    label: "E-Learning",
    description: "Interactive learning modules",
    formats: "MP4, MOV, WebM",
    iconName: "GraduationCap",
  },
];

const Step1ContentType = ({ form }: Props) => {
  const theme = useTheme();

  return (
    <Controller
      name="contentType"
      control={form.control}
      render={({ field, fieldState }) => (
        <Box>
          <Typography
            sx={{
              mb: 1.5,
            }}
            color="text.primary"
            variant="body1"
          >
            Select Content Type
          </Typography>

          <Grid container spacing={1.5}>
            {CONTENT_TYPES.map((type) => {
              const isActive = field.value === type.id;

              return (
                <Grid size={{ xs: 12, sm: 6 }} key={type.id}>
                  <Paper
                    elevation={0}
                    onClick={() => field.onChange(type.id)}
                    sx={{
                      p: 2,
                      borderRadius: "12px",
                      border: "2px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      bgcolor: isActive ? "primary.light" : "background.paper",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    {/* tiny icon box */}
                    <Box sx={{ 
                      display:{ xs: "flex",  sm: "block"},
                          
                          
                  alignItems: {
                          xs: "center",
                          sm: "flex-start",
                        },
                        gap: {
                          xs: 1,
                          sm: 0,
                        },
                        mb: 1,
                      }}
                    >
                      <CommonIcon
                        name={type?.iconName as LucideIconName}
                        color={theme.palette.primary.main}
                        size={24}
                      />

                      <Typography variant="body1">{type.label}</Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 1,
                        textTransform: "uppercase",
                      }}
                      variant="body2"
                      color="text.secondary"
                    >
                      {type.formats}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
          <Box sx={{mb:2}}></Box>
          {fieldState.error && (
            <Typography
              variant="body2"
              sx={{ color: "error.main", mt: 1, ml: 0.5 }}
            >
              {fieldState.error.message}
            </Typography>
          )}
        </Box>
      )}
    />
  );
};

export default Step1ContentType;
