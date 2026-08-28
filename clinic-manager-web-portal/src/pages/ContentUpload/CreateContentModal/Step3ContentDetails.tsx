// Step3ContentDetails.tsx
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";

import {
  CommonIcon,
  CommonTextField,
  RichTextEditor,
  ToggleSwitch,
} from "@/components/common";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "@/utils/toast";
import { useState } from "react";
import type { ContentType } from "./ContentSchema";

interface Props {
  form: any;
  procedure: string;
}

const TYPE_LABELS: Record<ContentType, string> = {
  image: "Image",
  video: "Video",
  blog: "Blog Article",
  elearning: "E-Learning",
};

const Step3ContentDetails = ({ form, procedure }: Props) => {
  const contentType = form.watch("contentType") as ContentType | null;

  const coverImageName = form.watch("coverImageName");
  const coverImageKey = form.watch("coverImageKey");

  const title = form.watch("contentTitle") as string;
  const description = form.watch("description") as string;
  const { uploadFile } = useFileUpload();
  const [uploadingCover, setUploadingCover] = useState(false);

  const hasCoverImage = Boolean(coverImageKey || coverImageName);

  const handleCoverClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png";

    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;

      if (!["image/jpeg", "image/png"].includes(f.type)) {
        form.setError("coverImageKey", {
          type: "manual",
          message: "Invalid file type. Allowed: JPG, JPEG, PNG",
        });
        toast.error("Invalid file type. Allowed: JPG, JPEG, PNG");
        return;
      }
      form.clearErrors("coverImageKey");

      form.setValue("coverImageName", f.name, { shouldDirty: true });
      setUploadingCover(true);

      try {
        const { key, url } = await uploadFile(f, "ContentUpload");

        form.setValue("coverImageKey", key, {
          shouldDirty: true,
          shouldValidate: true,
        });

        form.setValue("coverImageUrl", url, {
          shouldDirty: true,
        });
        toast.success("Cover image uploaded successfully");
      } catch (err) {

        toast.error("Cover image upload failed");

        console.error("Cover image upload error:", err);
        form.setError("coverImageKey", {
          type: "manual",
          message: "Thumbnail upload failed",
        });
      } finally {
        setUploadingCover(false);
      }
    };

    input.click();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Content Title */}
      <Controller
        name="contentTitle"
        control={form.control}
        render={({ field, fieldState }) => (
          <CommonTextField
            fullWidth
            label="Content Title *"
            placeholder="Enter a descriptive title..."
            {...field}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <CommonTextField
            fullWidth
            label="Content Description *"
            placeholder="enter the description..."
            {...field}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="coverImageKey"
        control={form.control}
        render={({ fieldState }) => (
          <CommonTextField
            fullWidth
            label="Upload Cover Photo *"
            value={coverImageName || ""}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            // onClick={!hasCoverImage ? handleCoverClick : undefined}
            onClick={
              !hasCoverImage && !uploadingCover ? handleCoverClick : undefined
            }
            InputProps={{
              readOnly: true,
              // sx: { cursor: "pointer" },
              sx: { cursor: uploadingCover ? "not-allowed" : "pointer" },
              inputProps: {
                style: { cursor: "pointer" },
              },
              endAdornment: (
                <IconButton
                  size="small"
                  disabled={uploadingCover}
                  // onClick={
                  onClick={(e) => {
                    e.stopPropagation();
                    // hasCoverImage
                    //   ? () => {
                    if (hasCoverImage) {
                      form.setValue("coverImageUrl", null);
                      form.setValue("coverImageName", null, {
                        shouldDirty: true,
                      });
                      form.setValue("coverImageKey", null, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      //   }
                      // : handleCoverClick
                    } else {
                      handleCoverClick();
                    }
                  }}
                >
                  {uploadingCover ? (
                    <CircularProgress size={16} />
                  ) : hasCoverImage ? (
                    <CommonIcon name="Trash2" size={16} color="red" />
                  ) : (
                    <CloudUploadOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              ),
            }}
          />
        )}
      />

      {contentType === "blog" && (
        <Controller
          name="blogHeader"
          control={form.control}
          shouldUnregister={false}
          render={({ field, fieldState }) => (
            <CommonTextField
              fullWidth
              label="Blog Header *"
              placeholder="Enter a descriptive header..."
              {...field}
              onChange={(e) => {
                field.onChange(e);
                form.trigger("blogHeader");
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}

      {contentType !== "blog" && (
        <Controller
          name="contentBody"
          control={form.control}
          shouldUnregister={false}
          render={({ field, fieldState }) => (
            <Box>
              <Typography
                sx={{
                  mb: 0.5,
                }}
                variant="body2"
                color="text.primary"
              >
                Write Content
              </Typography>

              <RichTextEditor
                value={field.value || ""}
                onChange={(val) => {
                  field.onChange(val);
                  form.trigger("contentBody");
                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            </Box>
          )}
        />
      )}
      {/* Content Summary card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.primary">
            Content Summary
          </Typography>

          {contentType && (
            <Chip
              label={TYPE_LABELS[contentType]}
              size="small"
              sx={{
                fontSize: 11,
                borderRadius: "999px",
                border: "1px solid",
                borderColor: "#DAB2FF",
                bgcolor: "#F3E8FF",
                color: "#8200DB",
              }}
            />
          )}
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "110px 1fr",
            },
            gap: { xs: 1, sm: 1 },
            rowGap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Procedure:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              minWidth: 0,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {procedure}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            File:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              minWidth: 0,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {coverImageName || "Not selected"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Title:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              minWidth: 0,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {title || "Not set"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Description:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              minWidth: 0,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {description || "Not set"}
          </Typography>
        </Box>
      </Paper>

      {/* Publish Immediately */}
      <Controller
        name="publishImmediately"
        control={form.control}
        render={({ field }) => (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <Box>
              <Typography variant="body2">Publish Immediately</Typography>

              <Typography variant="body2" color="text.secondary">
                Make content visible to patients right away
              </Typography>
            </Box>
            <ToggleSwitch
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          </Box>
        )}
      />
    </Box>
  );
};

export default Step3ContentDetails;
