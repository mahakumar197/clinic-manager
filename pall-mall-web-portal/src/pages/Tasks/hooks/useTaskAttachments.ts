import { useFileUpload } from "@/hooks/useFileUpload";
import { tasksService } from "@/services/modules/tasks.service";
import { uploadService } from "@/services/modules/upload.service";
import { mediaService } from "@/services/modules/media.service";
import { toast } from "@/utils/toast";
import { useState } from "react";

interface DownloadAttachment {
  key: string;
  filename: string;
}

export const useTaskAttachments = (
  taskId: string,
  refetchTaskDetails: () => void,
) => {
  const [loading, setLoading] = useState(false);
   const [commentAttachmentLoading, setCommentAttachmentLoading] = useState(false);
  const { uploadFile } = useFileUpload();

  const addAttachment = async (file: File, inComment: boolean = false) => {
    try {
      // setLoading(true);
      if (inComment) {
        setCommentAttachmentLoading(true);
      } else {
        setLoading(true);
      }
      const { key } = await uploadFile(file, "Task");

      const res = await tasksService.createAttachment({
        taskId,
        filename: file.name,
        s3Key: key,
        mimeType: file.type,
        inComment,
      });

      toast.success("Attachment added");

      if (!inComment) {
        refetchTaskDetails?.();
      }

      return res?.data?.id ?? null;
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to upload attachment",
      );
    } finally {
      // setLoading(false);
      if (inComment) {
        setCommentAttachmentLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleDownload = async (attachment: {
    key: string;
    filename: string;
  }) => {
    try {
      const url = await mediaService.getFileUrl(attachment.key);
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  return {
    addAttachment,
    handleDownload,
    loading,
    commentAttachmentLoading
  };
};
