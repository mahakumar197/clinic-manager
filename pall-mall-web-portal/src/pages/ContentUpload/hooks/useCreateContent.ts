import { useState } from "react";
import type { CreateContentFormValues } from "../CreateContentModal/ContentSchema";
import { contentService } from "@/services/modules/content.service";
import { ContentStatus, ContentType } from "@/services/types/content.enums";

interface Params {
  procedureId: string;
  imgCount?: number;
  author?: {
    id?: string;
    name?: string;
  };
}

export const useCreateContent = ({ procedureId, imgCount, author }: Params) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createContent = async (
    data: CreateContentFormValues,
    contentId?: string,  
  ): Promise<boolean> => {
    let payload: any;
    try {
      setLoading(true);
      setError(null);

      console.group("CREATE CONTENT");
      console.log("FORM DATA:", data);

      /** --------------------
       * BASE PAYLOAD
       * ------------------- */
      const payload: any = {
        title: data.contentTitle,
        description: data.description,
        content: data.contentBody ?? "",
        type: data.contentType,
        procedureId,
        status: data.publishImmediately
          ? ContentStatus.PUBLISHED
          : ContentStatus.DRAFT,
      };

      /** --------------------
       * THUMBNAIL
       * ------------------- */

      if (data.coverImageKey) {
        payload.thumbnailUrl = data.coverImageKey;
      }


      /** --------------------
       * IMAGE 
       * ------------------- */

        const extractBlobKey = (value?: string | null) => {
        if (!value) return null;

        if (!value.startsWith("http")) {
          return decodeURIComponent(value.replace(/^mobile-app\//, ""));
        }
        const marker = ".blob.core.windows.net/";
        const index = value.indexOf(marker);
        if (index === -1) return null;
        let key = value.substring(index + marker.length).split("?")[0];
        key = key.replace(/^mobile-app\//, "");
        key = decodeURIComponent(key);

        return key;
      };

      if (data.contentType === ContentType.IMAGE) {
        payload.imgCount = data.imageMode;

        const contentUrls: string[] = [];

        // SINGLE
        const singleKey = data.fileKey || extractBlobKey(data.fileUrl);
        if (singleKey) {
          contentUrls.push(singleKey);
        }

        // BEFORE
        const beforeKey =
          data.beforeFileKey || extractBlobKey(data.beforeFileUrl);
        if (beforeKey) {
          contentUrls.push(`before:${beforeKey}`);
        }

        // AFTER
        const afterKey = data.afterFileKey || extractBlobKey(data.afterFileUrl);
        if (afterKey) {
          contentUrls.push(`after:${afterKey}`);
        }

        if (contentUrls.length) {
          payload.contentUrl = contentUrls;
        }
      }

      /** --------------------
       * VIDEO
       * ------------------- */

      if (data.contentType === ContentType.VIDEO && data.fileKey) {
        payload.contentUrl = [data.fileKey];
      }

      /** --------------------
       * BLOG
       * ------------------- */

      if (data.contentType === ContentType.BLOG) {
        payload.blogHeader = data.blogHeader;
      }

      /** --------------------
       * ELEARNING
       * ------------------- */

      if (data.contentType === ContentType.ELEARNING && data.lessons?.length) {
        if (data.coverImageKey) {
          payload.thumbnailUrl = data.coverImageKey;
        }

        payload.eLearnings = data.lessons.reduce(
          (acc: any, lesson: any, index: number) => {
            const lessonPayload: any = {
              headertitle: lesson.header,
              title: lesson.title,
              lessoncontent: lesson.contentBody,
            };

            if (lesson.lessonFileKey) {
              lessonPayload.content_Url = lesson.lessonFileKey;
            }
            acc[`lesson${index + 1}`] = lessonPayload;
            return acc;
          },
          {},
        );
      }

      /** --------------------
       * AUTHOR (OPTIONAL)
       * ------------------- */
      if (author?.id) payload.authorId = author.id;
      if (author?.name) payload.authorName = author.name;

      console.log("FINAL API PAYLOAD:", payload);
      console.groupEnd();

      console.log(" FINAL PAYLOAD SENDING:", JSON.stringify(payload, null, 2));


      if (contentId) {
        await contentService.updateContent(contentId, payload);
      } else {
        await contentService.createContent(payload);
      }

      return true;
    } 
    // catch (err: any) {
    //   console.error("CREATE CONTENT ERROR:", err);
    //   setError(err?.message ?? "Failed to create content");
    //   return false;
    // } finally {
    //   setLoading(false);
    // }

  catch (err: any) {
  console.group("CREATE CONTENT FAILED");

  console.error("RAW ERROR:", err);

  if (err?.response) {
    console.error("STATUS:", err.response.status);
    console.error("DATA:", err.response.data);
    console.error("HEADERS:", err.response.headers);
  }

  if (err?.message) {
    console.error("MESSAGE:", err.message);
  }

  console.log("PAYLOAD THAT FAILED:", payload);

  console.groupEnd();

  setError(err?.message ?? "Failed to create content");
  return false;
} finally {
  setLoading(false);
}

  };

  return { createContent, loading, error };
};
