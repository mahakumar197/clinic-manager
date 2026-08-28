import { BaseTextField, CommonButton, CommonIcon } from "@/components/common";
import { Tooltip, Typography, Box, useTheme } from "@mui/material";
import CommentItem from "./CommentItem";

const CommentsSection = ({
  comments,
  comment,
  setComment,
  commentFile,
  commentPreviewUrl,
  pendingAttachmentName,
  handleChooseCommentFile,
  handleCommentFileChange,
  handleRemoveCommentAttachment,
  handlePostComment,
  commentLoading,
  commentUploading,
  commentFileRef,
  disabled,
}: {
  comments: any[];
  comment: string;
  setComment: (val: string) => void;
  commentFile: File | null;
  commentPreviewUrl: string | null;
  pendingAttachmentName: string | null;
  handleChooseCommentFile: () => void;
  handleCommentFileChange: (e: any) => void;
  handleRemoveCommentAttachment: () => void;
  handlePostComment: () => void;
  commentLoading: boolean;
  commentUploading: boolean;
  commentFileRef: any;
  disabled?: boolean;
}) => {
  const theme = useTheme();
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="body1">Comments</Typography>
        <Box
          sx={{
            minWidth: 28,
            height: 24,
            px: 1,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="overline">
            {comments.length}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          maxHeight: 170,
          overflowY: "auto",
          pr: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 2,
        }}
      >
        {comments.length === 0 && (
          <Typography>Post your comment</Typography>
        )}
        {comments.map((c) => (
          <CommentItem key={c.id} c={c} />
        ))}
      </Box>
      <Box
        sx={{
          width: "100%",
          border: `1px solid${theme.palette.divider}`,
          mb: 2,
        }}
      />

      {/* Comment Input */}
      <BaseTextField
        startIcon={false}
        fullWidth
        multiline
        rows={3}
        placeholder="Add a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={disabled}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: disabled ? "#f5f5f5" : "#F3F3F5",
            height: "96px",
          },
        }}
      />

      {/* <CommonTextArea
                  minRows={5}
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  /> */}
      {pendingAttachmentName && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
            mb: 1,
            p: 1,
            border: "none",
          }}
        >
          {commentFile && commentPreviewUrl && (
            <Tooltip
              title={commentFile.name}
              arrow
              placement="left"
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
                arrow: {
                  sx: { color: "rgba(0,0,0,0.55)" },
                },
              }}
            >
              <Box
                sx={{ width: 50, height: 50, position: "relative" }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover .overlay": { opacity: 1 },
                  }}
                  onClick={() =>
                    window.open(commentPreviewUrl, "_blank")
                  }
                >
                  {/* IMAGE */}
                  {commentFile.type.startsWith("image/") && (
                    <Box
                      component="img"
                      src={commentPreviewUrl}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  {/* VIDEO */}
                  {commentFile.type.startsWith("video/") && (
                    <video
                      src={commentPreviewUrl}
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  {/* PDF / DOC */}
                  {!commentFile.type.startsWith("image/") &&
                    !commentFile.type.startsWith("video/") && (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "background.default",
                        }}
                      >
                        <CommonIcon name="FileText" size={22} />
                      </Box>
                    )}

                  {/* 👁 HOVER OVERLAY */}
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
                    <CommonIcon name="Eye" size={18} color="#fff" />
                  </Box>

                  {/* ❌ REMOVE */}
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCommentAttachment();
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

          {/* <Typography variant="body2">
                      {pendingAttachmentName}
                    </Typography>

                    <CommonIconButton
                      size="small"
                      onClick={handleRemoveCommentAttachment}
                      icon={<CommonIcon name="X" size={14} />}
                    ></CommonIconButton> */}
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          justifyContent: "space-between",
          // alignItems: "flex-start",
          flexDirection: {
            xs: "column",   
            sm: "row",      
            
          },
          alignItems: {
            xs: "stretch",
            sm: "flex-start",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CommonButton
            variant="outlined"
            startIcon={<CommonIcon name="Paperclip" />}
            onClick={handleChooseCommentFile}
            loading={commentUploading}
            disabled={commentUploading || disabled}
          >
            {commentUploading ? "Uploading..." : "Attach File"}
            <Typography variant="button"></Typography>
          </CommonButton>
          <input
            type="file"
            hidden
            ref={commentFileRef}
            onChange={handleCommentFileChange}
            disabled={disabled}
          />
          {/* {commentFile && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 1, color: "text.secondary", fontSize: 11 }}
                      >
                        Attached: {commentFile.name}
                      </Typography>
                    )} */}
                  </Box>
                  <CommonButton
                    variant="contained"
                    startIcon={<CommonIcon name="Send" />}
                    disabled={commentLoading || !comment.trim() || commentUploading || disabled}
                    // onClick={async () => {
                    //   await addComment(comment);
                    //   setComment("");
                    // }}
                    onClick={handlePostComment}
                  >
                    {commentLoading ? "Posting..." : "Post comment"}
                  </CommonButton>
                </Box>
             </> 
  );
};

export default CommentsSection;
