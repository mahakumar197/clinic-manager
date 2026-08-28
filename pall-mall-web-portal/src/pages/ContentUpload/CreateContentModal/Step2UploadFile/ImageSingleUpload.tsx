// ImageSingleUpload.tsx
import { CommonButton, CommonIcon } from "@/components/common";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "@/utils/toast";
import { Paper, Typography, useTheme } from "@mui/material";
import { useRef, useState } from "react";

interface Props {
  form: any;
  field: any;
  fieldState: any;
  config: { label: string; accept: string[] };
  acceptString: string;
  contentType: string;
}

const ImageSingleUpload = ({
  form,
  field,
  fieldState,
  config,
  acceptString,
  contentType,
}: Props) => {
  const theme = useTheme();
  const { uploadFile } = useFileUpload();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const singleInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (f: File | null) => {
    if (!f) {
      field.onChange(null);
      form.setValue("fileKey", null, { shouldDirty: true, shouldValidate: true });
      return;
    }

    if (!config.accept.includes(f.type)) {
      field.onChange(null);
      form.setValue("fileKey", null);
      form.setError("file", {
        type: "manual",
        message: `Invalid file type. Allowed: ${config.label}`,
      });
      toast.error(`Invalid file type. Allowed: ${config.label}`);
      console.error("Invalid file type:", f.type);
      return;
    }

    form.clearErrors("file");

    setUploadingFile(true);

    field.onChange(f);
    const uploadType =
      contentType === "elearning" ? "ELearning" : "ContentUpload";

    try {
      const { key } = await uploadFile(f, uploadType);

      form.setValue("fileKey", key);
      toast.success("File uploaded successfully");

    } catch (err) {

      toast.error("File upload failed. Please try again.");
      console.error("Upload failed:", err);

      form.setError("file", {
        type: "manual",
        message: "File upload failed. Please try again.",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleChooseClick = () => singleInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    processFile(f);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    processFile(f);
  };

  return (
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
      onDrop={handleDrop}
      sx={{
        borderRadius: "12px",
        border: "1px dashed",
        borderColor: fieldState.error
          ? theme.palette.error.main
          : isDragging
            ? theme.palette.primary.main
            : theme.palette.divider,
        bgcolor: isDragging ? "primary.light" : "background.paper",
        p: 4,
        textAlign: "center",
        transition: "0.2s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <CommonIcon name="Upload" color={theme.palette.primary.main} size={48} />

      <>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Drag and drop your file here
        </Typography>
        <Typography variant="caption" sx={{ mt: 1 }} color="text.secondary">
          or
        </Typography>
      </>

      <CommonButton
        variant="contained"
        size="small"
        sx={{ mt: 2 }}
        onClick={handleChooseClick}
        disabled={uploadingFile}
        loading={uploadingFile}
      >
        {uploadingFile ? "Uploading" : "Choose File"}
      </CommonButton>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
        Supported formats: {config.label}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Max size 100MB
      </Typography>

      <input
        ref={singleInputRef}
        type="file"
        hidden
        accept={acceptString}
        onChange={handleFileChange}
      />
    </Paper>
  );
};

export default ImageSingleUpload;
