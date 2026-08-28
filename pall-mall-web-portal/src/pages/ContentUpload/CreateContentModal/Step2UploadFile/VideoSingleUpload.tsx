// VideoSingleUpload.tsx
import {
  BaseSelect,
  CommonButton,
  CommonIcon,
  CommonTextField,
} from "@/components/common";
import ImageSkeleton from "@/components/common/CommonSkeleton/base/ImageSkeleton";
import { useFileUpload } from "@/hooks/useFileUpload";
import { SelectOption } from "@/types/select";
import { toast } from "@/utils/toast";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface Props {
  form: any;
  field: any;
  fieldState: any;
  config: { label: string; accept: string[] };
  acceptString: string;
  contentType: string;
}

const uploadModeOptions: SelectOption[] = [
  { label: "Upload Video", value: "file" },
  { label: "Paste URL", value: "url" },
];

const VideoSingleUpload = ({
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
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [urlUploaded, setUrlUploaded] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const processFile = async (f: File | null) => {
    if (!f) {
      field.onChange(null);
      form.setValue("fileKey", null);
      return;
    }

    if (!config.accept.includes(f.type)) {
      field.onChange(null);
      form.setValue("fileKey", null);
      form.setError("file", {
        type: "manual",
        message: `Invalid file type. Allowed: ${config.label}`,
      });
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
      toast.success("Video uploaded successfully");
    } catch (err) {

      toast.error("Video upload failed");

      console.error("Video upload error:", err);
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

  const handleUrlUpload = async () => {
    if (!videoUrl) return;

    form.clearErrors("file");
    setUploadingFile(true);

    const uploadType =
      contentType === "elearning" ? "ELearning" : "ContentUpload";

    try {
      const { key } = await uploadFile(videoUrl, uploadType);

      form.setValue("fileKey", key);
      form.setValue("contentUrl", videoUrl);
      field.onChange(null);
      setUploadSuccess(true);
      setUrlUploaded(true);
      setUploadedUrl(videoUrl);
    } catch (err) {
      form.setError("file", {
        type: "manual",
        message: "URL upload failed. Please try again.",
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleClear = () => {
    setVideoUrl("");
    setUploadSuccess(false);
    setUrlUploaded(false);
    setUploadedUrl(null);
    form.setValue("fileKey", null);
    form.setValue("contentUrl", null);
    form.setValue("fileUrl", null);
  };

  const fileKey = form.watch("fileKey");
  const contentUrl = form.watch("contentUrl");
  const fileUrl = form.watch("fileUrl");

  const getEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube - watch, shorts, youtu.be
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = null;

      if (url.includes("youtu.be")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      } else if (url.includes("/shorts/")) {
        videoId = url.split("/shorts/")[1]?.split("?")[0];
      } else if (url.includes("v=")) {
        videoId = url.split("v=")[1]?.split("&")[0];
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  };

  const isValidUrl = (url: string) => /^https:\/\/.+/i.test(url);

  const isExternalLink = (url: string) =>
    isValidUrl(url) &&
    !url.includes("youtube.com") &&
    !url.includes("youtu.be") &&
    !url.includes("vimeo.com");



  useEffect(() => {
    if (contentUrl) {
      // User pasted URL
      setUploadMode("url");
      setVideoUrl(contentUrl);
      setUploadedUrl(contentUrl);
      setUrlUploaded(true);
      return;
    }

    if (fileKey) {
      // Uploaded file
      setUploadMode("file");
      return;
    }

    if (fileUrl) {
      const isYoutubeOrVimeo =
        fileUrl.includes("youtube.com") ||
        fileUrl.includes("youtu.be") ||
        fileUrl.includes("vimeo.com");

      const isAzureBlob = fileUrl.includes("blob.core.windows.net");

      if (isYoutubeOrVimeo || !isAzureBlob) {
        // External URL
        setUploadMode("url");
        setVideoUrl(fileUrl);
        setUploadedUrl(fileUrl);
        setUrlUploaded(true);
      } else {
        // Blob file
        setUploadMode("file");
      }
    }
  }, []);



  const embedUrl = getEmbedUrl(
    fileKey || contentUrl || uploadedUrl || "",
  );

  const shouldDisableUploadMode = Boolean(
  fileKey || contentUrl || uploadedUrl || fileUrl
);



  return (
    <Box>
      {/* Upload Mode Dropdown */}
      <BaseSelect
        sx={{
          mb: 2,
          // ...(Boolean(fileKey || contentUrl || uploadedUrl || fileUrl) && {
          //   opacity: 0.6,
          //   pointerEvents: "none"
          // })
        }}
        disabled={shouldDisableUploadMode} 
        placeholder="Upload Mode"
        name="uploadMode"
        value={
          uploadModeOptions.find((opt) => opt.value === uploadMode) || null
        }
        onChange={(newValue: SelectOption | null) => {
          if (Boolean(fileKey || contentUrl || uploadedUrl || fileUrl)) return;
          setUploadMode((newValue?.value as "file" | "url") || "file");
        }}
        options={uploadModeOptions}
      />

      {uploadMode === "file" && (
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
          <CommonIcon
            name="Upload"
            color={theme.palette.primary.main}
            size={48}
          />

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
      )}

      {uploadMode === "url" && (
        <Box>
          <CommonTextField
            label="Video URL"
            fullWidth
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v"
            sx={{ mb: 2 }}
            error={videoUrl !== "" && !isValidUrl(videoUrl)}
            helperText={
              videoUrl !== "" && !isValidUrl(videoUrl)
                ? "Paste valid URL"
                : undefined
            }
            endIcon={
              (videoUrl && !urlUploaded) || urlUploaded ? (
                <Box
                  onClick={handleClear}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {urlUploaded ? (
                    <CommonIcon name="Trash2" size={18} color="red" />
                  ) : (
                    <CommonIcon name="X" size={18} />
                  )}
                </Box>
              ) : null
            }
          />
          {!urlUploaded && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CommonButton
                variant="contained"
                onClick={handleUrlUpload}
                disabled={uploadingFile || !isValidUrl(videoUrl)}
                loading={uploadingFile}
              >
                {uploadingFile ? "Uploading" : "Upload"}
              </CommonButton>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        {uploadMode === "url" && uploadingFile && videoUrl && !isExternalLink(videoUrl) && (<ImageSkeleton />)}

        {/* iframe (URL mode only) */}
        {!uploadingFile && uploadMode === "url" && embedUrl && (
          <iframe
            src={embedUrl}
            width="100%"
            height="260"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: "8px" }}
          />
        )}

        {/* External link preview button */}
        {!uploadingFile &&
          uploadMode === "url" &&
          uploadedUrl &&
          !embedUrl &&
          isExternalLink(uploadedUrl) && (
            <Box sx={{ mt: 1, textAlign: "center" }}>
              <CommonButton
                variant="outlined"
                size="small"
                onClick={() => window.open(uploadedUrl, "_blank")}
              >
                Click to Preview
              </CommonButton>
            </Box>
          )}
      </Box>
    </Box>
  );
};

export default VideoSingleUpload;
