// PreviewSection.tsx
import { CommonIcon } from "@/components/common";
import { Box, Dialog, Tooltip, useTheme } from "@mui/material";
import { useState } from "react";

interface Props {
  file: File | null;
  fileUrl: string | null;
  previewUrl: string | null;
  beforeFile: File | null;
  afterFile: File | null;
  beforePreview: string | null;
  afterPreview: string | null;
  beforeFileUrl: string | null;
  afterFileUrl: string | null;
  contentType: string;
  isSingle: boolean;
  isMultiple: boolean;
  form: any;
  singleInputRef: React.RefObject<HTMLInputElement>;
}

const PreviewSection = ({
  file,
  fileUrl,
  previewUrl,
  beforeFile,
  afterFile,
  beforePreview,
  afterPreview,
  beforeFileUrl,
  afterFileUrl,
  contentType,
  isSingle,
  isMultiple,
  form,
  singleInputRef,
}: Props) => {
  const theme = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  const beforeSrc = beforePreview || beforeFileUrl;
  const afterSrc = afterPreview || afterFileUrl;

  const isVideoPreview =
    (activeFile && activeFile.type.startsWith("video/")) ||
    (!activeFile && contentType === "video");

  const previewSrc = file ? previewUrl : fileUrl;

  const isImage =
    file?.type?.startsWith("image/") || (!file && contentType === "image");

  const isVideo =
    file?.type?.startsWith("video/") || (!file && contentType === "video");

  const isExternalLink = (url: string) =>
    /^https?:\/\//i.test(url) &&
    !url.includes("blob.core.windows.net");


  return (
    <>
      {(file || (fileUrl && !isExternalLink(fileUrl))) &&
        (contentType === "image" ? isSingle : true) && (
          <Box sx={{ mt: 2 }}>
            <Tooltip
              title={file?.name || "Uploaded file"}
              arrow
              placement="bottom"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: "rgba(0,0,0,0.55)",
                    fontSize: 12,
                    px: 1.2,
                    py: 0.5,
                    borderRadius: "6px",
                  },
                },
                arrow: { sx: { color: "rgba(0,0,0,0.55)" } },
                popper: {
                  sx: {
                    '&[data-popper-placement*="bottom"] .MuiTooltip-tooltip': {
                      marginTop: "0.5px",
                    },
                  },
                },
              }}
            >
              <Box sx={{ width: 86, height: 86, position: "relative" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover .overlay": { opacity: 1 },
                  }}
                  onClick={() => {
                    setActiveFile(file ?? null);
                    setActivePreviewUrl(previewSrc);
                    setPreviewOpen(true);
                  }}
                >
                  {isImage && previewSrc && (
                    <Box
                      component="img"
                      src={previewSrc}
                      alt={file?.name || "Uploaded image"}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                  {isVideo && previewSrc && (
                    <video
                      src={previewSrc}
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {!isImage && !isVideo && (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        bgcolor: "background.default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CommonIcon name="FileText" size={32} />
                    </Box>
                  )}
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      borderRadius: "8px",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "0.2s ease",
                    }}
                  >
                    <CommonIcon name="Eye" size={22} color="#fff" />
                  </Box>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      form.setValue("file", null);
                      form.setValue("fileUrl", null);
                      form.setValue("fileKey", null, { shouldDirty: true, shouldValidate: true });
                      if (singleInputRef.current)
                        singleInputRef.current.value = "";
                    }}
                    sx={{
                      position: "absolute",
                      top: -5,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,0,0,0.55)",
                      border: "1px",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 4,
                    }}
                  >
                    <CommonIcon
                      name="X"
                      size={12}
                      color={theme.palette.divider}
                    />
                  </Box>
                </Box>
              </Box>
            </Tooltip>
          </Box>
        )}
      {isMultiple && (
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {(beforePreview || beforeFileUrl) && (
            <Tooltip title={beforeFile?.name || "Before Image"} arrow>
              <Box sx={{ width: 86, height: 86, position: "relative" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "0.2s ease",
                    "&:hover": { borderColor: "primary.main" },
                    "&:hover .overlay": { opacity: 1 },
                  }}
                  onClick={() => {
                    setActiveFile(beforeFile ?? null);
                    setActivePreviewUrl(beforeSrc);
                    setPreviewOpen(true);
                  }}
                >
                  <Box
                    component="img"
                    src={beforeSrc}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      borderRadius: "8px",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "0.2s ease",
                    }}
                  >
                    <CommonIcon name="Eye" size={22} color="#fff" />
                  </Box>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      form.setValue("beforeFile", null);
                      form.setValue("beforeFileUrl", null);
                      form.setValue("beforeFileKey", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    sx={{
                      position: "absolute",
                      top: -5,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 4,
                    }}
                  >
                    <CommonIcon
                      name="X"
                      size={12}
                      color={theme.palette.divider}
                    />
                  </Box>
                </Box>
              </Box>
            </Tooltip>
          )}
          {(afterPreview || afterFileUrl) && (
            <Tooltip title={afterFile?.name || "After Image"} arrow>
              <Box sx={{ width: 86, height: 86, position: "relative" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "0.2s ease",
                    "&:hover": { borderColor: "primary.main" },
                    "&:hover .overlay": { opacity: 1 },
                  }}
                  onClick={() => {
                    setActiveFile(afterFile);
                    setActivePreviewUrl(afterSrc);
                    setPreviewOpen(true);
                  }}
                >
                  <Box
                    component="img"
                    src={afterSrc}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0,0,0,0.55)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "0.2s ease",
                    }}
                  >
                    <CommonIcon name="Eye" size={22} color="#fff" />
                  </Box>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      form.setValue("afterFile", null);
                      form.setValue("afterFileUrl", null);
                      form.setValue("afterFileKey", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    sx={{
                      position: "absolute",
                      top: -5,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 4,
                    }}
                  >
                    <CommonIcon
                      name="X"
                      size={12}
                      color={theme.palette.divider}
                    />
                  </Box>
                </Box>
              </Box>
            </Tooltip>
          )}
        </Box>
      )}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: "relative", bgcolor: "#000" }}>
          <Box
            onClick={() => setPreviewOpen(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 10,
              cursor: "pointer",
            }}
          >
            <CommonIcon name="X" color="#fff" />
          </Box>
          {activePreviewUrl && (
            <>
              {isVideoPreview ? (
                <video
                  src={activePreviewUrl}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "80vh" }}
                />
              ) : (
                <Box
                  component="img"
                  src={activePreviewUrl}
                  sx={{
                    width: "100%",
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                />
              )}
            </>
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default PreviewSection;
