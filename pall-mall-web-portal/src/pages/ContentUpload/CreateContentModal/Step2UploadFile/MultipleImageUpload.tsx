// MultipleImageUpload.tsx
import { CommonButton, CommonIcon } from "@/components/common";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "@/utils/toast";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useRef, useState } from "react";
import { Controller } from "react-hook-form";

interface Props {
  form: any;
  config: { label: string; accept: string[] };
  acceptString: string;
}

const MultipleImageUpload = ({ form, config, acceptString }: Props) => {
  const theme = useTheme();
  const { uploadFile } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImageSide, setUploadingImageSide] = useState<
    "before" | "after" | null
  >(null);

  // Read errors from the Zod-validated key fields so we can surface them
  // in the UI-bound Controller blocks (beforeFile / afterFile).
  const { beforeFileKey: beforeKeyErr, afterFileKey: afterKeyErr } =
    form.formState.errors;

  const beforeInputRef = useRef<HTMLInputElement | null>(null);
  const afterInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      {/* ================= BEFORE IMAGE ================= */}
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Before Image
        </Typography>

        {/*  BEFORE FILE */}
        <Controller
          name="beforeFile"
          control={form.control}
          render={({ field }) => (
            <Paper
              elevation={0}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0] || null;
                if (!f) return;

                // keep UI
                field.onChange(f);
                setUploadingImageSide("before");

                try {
                  const { key } = await uploadFile(f, "ContentUpload");

                  form.setValue("beforeFileKey", key, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });

                  form.clearErrors("beforeFile");

                  toast.success("Before image uploaded successfully");
                } catch (err) {

                  toast.error("Before image upload failed");

                  console.error("Before image upload error:", err);
                  form.setError("beforeFile", {
                    type: "manual",
                    message: "Before image upload failed",
                  });
                } finally {
                  setUploadingImageSide(null);
                }
              }}
              sx={{
                borderRadius: "12px",
                border: "1px dashed",
                borderColor: isDragging
                  ? theme.palette.primary.main
                  : beforeKeyErr
                    ? theme.palette.error.main
                    : theme.palette.divider,
                bgcolor: isDragging ? "primary.light" : "background.paper",
                p: 1.8,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <CommonIcon
                name="Upload"
                color={theme.palette.primary.main}
                size={35}
              />

              <Typography
                variant="button"
                sx={{ mt: 1 }}
                color="text.secondary"
              >
                Drag and drop your file here
              </Typography>

              <Typography
                variant="caption"
                sx={{ mt: 0.5 }}
                color="text.secondary"
              >
                or
              </Typography>

              {/* BEFORE input */}
              <CommonButton
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => beforeInputRef.current?.click()}
                disabled={uploadingImageSide === "before"}
                loading={uploadingImageSide === "before"}
              >
                {uploadingImageSide === "before" ? "Uploading" : "Choose File"}
              </CommonButton>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Supported formats: {config.label}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Max size 100MB
              </Typography>

              <input
                ref={beforeInputRef}
                type="file"
                hidden
                accept={acceptString}
                onChange={async (e) => {
                  const f = e.target.files?.[0] || null;
                  if (!f) return;

                  field.onChange(f);
                  setUploadingImageSide("before");

                  try {
                    const { key } = await uploadFile(f, "ContentUpload");

                    form.setValue("beforeFileKey", key, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });

                    form.clearErrors("beforeFile");

                    toast.success("Before image uploaded successfully");
                  } catch (err) {
                    toast.error("Before image upload failed");

                    console.error("Before image upload error:", err);

                    form.setError("beforeFile", {
                      type: "manual",
                      message: "Before image upload failed",
                    });
                  } finally {
                    setUploadingImageSide(null);
                  }
                }}
              />

              {/* Show Zod key-field error directly — no useEffect bridge needed */}
              {beforeKeyErr?.message && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1 }}
                >
                  {String(beforeKeyErr.message)}
                </Typography>
              )}
            </Paper>
          )}
        />
      </Box>

      {/* ================= AFTER IMAGE ================= */}
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          After Image
        </Typography>

        {/*  AFTER FILE */}
        <Controller
          name="afterFile"
          control={form.control}
          render={({ field }) => (
            <Paper
              elevation={0}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0] || null;
                if (!f) return;
                field.onChange(f);
                setUploadingImageSide("after");
                try {
                  const { key } = await uploadFile(f, "ContentUpload");
                  // form.setValue("afterFileKey", key);
                  form.setValue("afterFileKey", key, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });

                  form.clearErrors("afterFile");

                  toast.success("After image uploaded successfully");
                } catch (err) {

                  toast.error("After image upload failed");

                  console.error("After image upload error:", err);
                  form.setError("afterFile", {
                    type: "manual",
                    message: "After image upload failed",
                  });
                } finally {
                  setUploadingImageSide(null);
                }
              }}
              sx={{
                borderRadius: "12px",
                border: "1px dashed",
                borderColor: isDragging
                  ? theme.palette.primary.main
                  : afterKeyErr
                    ? theme.palette.error.main
                    : theme.palette.divider,
                bgcolor: isDragging ? "primary.light" : "background.paper",
                p: 1.8,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <CommonIcon
                name="Upload"
                color={theme.palette.primary.main}
                size={35}
              />

              <Typography
                variant="button"
                sx={{ mt: 1 }}
                color="text.secondary"
              >
                Drag and drop your file here
              </Typography>

              <Typography
                variant="caption"
                sx={{ mt: 0.5 }}
                color="text.secondary"
              >
                or
              </Typography>

              {/* AFTER input */}
              <CommonButton
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => afterInputRef.current?.click()}
                disabled={uploadingImageSide === "after"}
                loading={uploadingImageSide === "after"}
              >
                {uploadingImageSide === "after" ? "Uploading" : "Choose File"}
              </CommonButton>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Supported formats: {config.label}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Max size 100MB
              </Typography>

              <input
                ref={afterInputRef}
                type="file"
                hidden
                accept={acceptString}
                onChange={async (e) => {
                  const f = e.target.files?.[0] || null;
                  if (!f) return;
                  field.onChange(f);
                  setUploadingImageSide("after");
                  try {
                    const { key } = await uploadFile(f, "ContentUpload");
                    form.setValue("afterFileKey", key, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });

                    form.clearErrors("afterFile");

                    toast.success("After image uploaded successfully");
                  } catch (err) {

                    toast.error("After image upload failed");

                    console.error("After image upload error:", err);

                    form.setError("afterFile", {
                      type: "manual",
                      message: "After image upload failed",
                    });
                  } finally {
                    setUploadingImageSide(null);
                  }
                }}
              />

              {/* Show Zod key-field error directly — no useEffect bridge needed */}
              {afterKeyErr?.message && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1 }}
                >
                  {String(afterKeyErr.message)}
                </Typography>
              )}
            </Paper>
          )}
        />
      </Box>
    </Box>
  );
};

export default MultipleImageUpload;
