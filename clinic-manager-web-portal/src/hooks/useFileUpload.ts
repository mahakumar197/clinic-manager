import { useState } from "react";
import { uploadService } from "@/services/modules/upload.service";

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (
    file: File | string,
    category: string,
    folderPath?: string,
  ) => {
    setUploading(true);

    try {
      const res = await uploadService.uploadFile({
        file,
        category,
        folderPath,
      });

      return res; // { url, key }
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
  };
};
