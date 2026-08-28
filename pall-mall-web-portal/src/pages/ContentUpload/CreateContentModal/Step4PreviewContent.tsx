// Step4PreviewContent.tsx
import { Box, Paper, Typography } from "@mui/material";
import { useMemo } from "react";

interface Step4PreviewContentProps {
  form: any;
}

const Step4PreviewContent = ({ form }: Step4PreviewContentProps) => {
  const { watch } = form;

  const contentType = watch("contentType") as string | null;
  const file = watch("file") as File | null;
  const title = watch("contentTitle") as string;
  const richText = watch("richText") as string;
  const contentBody = watch("contentBody") as string;

  const description = watch("description") as string;

  const publishImmediately = watch("publishImmediately") as boolean;

  const fileUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );


  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
        Preview
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          p: 2,
        }}
      >
        <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
          Type: <strong>{contentType || "Not set"}</strong>
        </Typography>

        <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
          Title: <strong>{title || "Not set"}</strong>
        </Typography>

        <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
          Publish Immediately:{" "}
          <strong>{publishImmediately ? "Yes" : "No"}</strong>
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Description: <strong>{description || "Not set"}</strong>
        </Typography>
        {file && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>
              File preview
            </Typography>

            {contentType === "image" && fileUrl && (
              <Box
                component="img"
                src={fileUrl}
                alt={file.name}
                sx={{
                  maxWidth: "100%",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            )}

            {contentType === "video" && fileUrl && (
              <Box
                component="video"
                src={fileUrl}
                controls
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
            )}

            {(contentType === "blog" || contentType === "elearning") && (
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {file.name}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          p: 2,
          maxHeight: 200,
          overflow: "auto",
        }}
      >
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: "text.primary" }}
        >
          Content Preview
        </Typography>

        <Box
          sx={{
            fontSize: 12,
            color: "text.secondary",

            /*  paragraphs */
            "& p": {
              marginBottom: 1,
            },

            /*  restore list styles */
            "& ul": {
              listStyleType: "disc",
              paddingLeft: "20px",
              marginBottom: "8px",
            },
            "& ol": {
              listStyleType: "decimal",
              paddingLeft: "20px",
              marginBottom: "8px",
            },

            /* spacing for list items */
            "& li": {
              marginBottom: "4px",
            },
          }}
          dangerouslySetInnerHTML={{
            __html: contentBody || "", 
          }}
        />
      </Paper>
    </Box>
  );
};

export default Step4PreviewContent;
