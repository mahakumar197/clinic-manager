import { CommonButton, CommonIcon, CommonIconButton } from "@/components/common";
import { Box, Tooltip, Typography } from "@mui/material";


const AttachmentSection = ({
  attachments,
  handleChooseSidebarFile,
  sidebarFile,
  sidebarFileRef,
  handleSidebarFileChange,
  handleDownload,
  attachmentLoading,
  theme,
  tablePalette,
  disabled = false
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "14px",
        border: `1px solid ${theme.palette.divider}`,
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
      >
        <Typography variant="body1">Attachments</Typography>
        <Box
          sx={{
            minWidth: "25px",
            height: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            px: 1,
          }}
        >
          <Typography variant="overline">
            {attachments.length}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          maxHeight: "180px",
          overflowY: "auto",
          pr: 1,
        }}
      >
        {attachments.map((attachment, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "12px",
              backgroundColor: "background.paper",
              cursor: "pointer",
              transition: "0.2s ease",
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                backgroundColor:
                  tablePalette.tableTextBackground.manager,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CommonIcon name="FileText" color="#155DFC" />
            </Box>

            {/* File Name & Size */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minWidth: 0,
              }}
            >
               <Tooltip
                      title={attachment.filename}
                      arrow
                      disableHoverListener={attachment.filename.length < 30}
                    >
              <Typography variant="body2" sx={{
                fontWeight: 500, whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {attachment.filename}
              </Typography>
              </Tooltip>
              {/* <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {attachment.size}
                        </Typography> */}
                      </Box>

                      <CommonIconButton
                        icon={<CommonIcon name="Download" size={20} />}
                        onClick={(e) => {
                          e.stopPropagation();

                          if (!attachment?.s3_key) return;

                          handleDownload({
                            key: attachment.s3_key,
                            filename: attachment.filename,
                          });
                        }}
                      />
                    </Box>
                  ))}
                </Box>

                {/* Add Attachment */}
                <CommonButton
                  variant="outlined"
                  sx={{
                    color: "text.primary",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                  startIcon={<CommonIcon name="Paperclip" />}
                  onClick={handleChooseSidebarFile}
                  loading={attachmentLoading}
                  disabled={disabled}
                >
                  <Typography variant="button">Add Attachment</Typography>
                </CommonButton>
                <input
                  type="file"
                  hidden
                  ref={sidebarFileRef}
                  onChange={handleSidebarFileChange}
                />
                {sidebarFile && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    Attached: {sidebarFile.name}
                  </Typography>
                )}
              </Box>
  );
};

export default AttachmentSection;
