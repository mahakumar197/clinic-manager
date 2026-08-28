
import { z } from "zod";

const contentTypeEnum = z.enum(["image", "video", "blog", "elearning"]);
export type ContentType = z.infer<typeof contentTypeEnum>;

export const CreateContentSchema = z
  .object({
    // ======================
    // STEP 1
    // ======================
    contentType: contentTypeEnum.nullable(),

    // ======================
    // STEP 2
    // ======================
    imageMode: z.number().nullable().optional(),




    /** -------------------------
     * NEW (KEY BASED)
     * -------------------------- */
    fileKey: z.string().optional().nullable(),
    fileUrl: z.string().optional().nullable(),

    beforeFileKey: z.string().optional().nullable(),
    beforeFileUrl: z.string().optional().nullable(),

    afterFileKey: z.string().optional().nullable(),
    afterFileUrl: z.string().optional().nullable(),

    /** -------------------------
     * COMMON FIELDS
     * -------------------------- */
    lessons: z.array(z.any()).optional(),

    // ======================
    // STEP 3
    // ======================
    contentTitle: z.string(),
    description: z.string(),

    contentBody: z.string(),
    blogHeader: z.string(),

    coverImageKey: z.string().nullable().optional(),
    coverImageUrl: z.string().nullable().optional(),
    coverImageName: z.string().nullable().optional(),

    publishImmediately: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    /* ======================================================
     * STEP 1 – CONTENT TYPE
     * ====================================================== */
    if (!data.contentType) {
      ctx.addIssue({
        path: ["contentType"],
        message: "Please select a content type",
        code: z.ZodIssueCode.custom,
      });
    }

    /* ======================================================
     * STEP 2 – IMAGE
     * ====================================================== */
    if (data.contentType === "image") {
      if (!data.imageMode) {
        ctx.addIssue({
          path: ["imageMode"],
          message: "Please select image type",
          code: z.ZodIssueCode.custom,
        });
      }

      const isMultipleMode = data.imageMode === 88; // 88 = "Multiple"

      if (isMultipleMode) {
        // ── Multiple (Before / After) ──────────────────────────────────────
        // Accept either a freshly-uploaded key OR a pre-existing URL (Edit mode)
        const hasBefore = !!data.beforeFileKey || !!data.beforeFileUrl;
        const hasAfter = !!data.afterFileKey || !!data.afterFileUrl;

        if (!hasBefore) {
          ctx.addIssue({
            path: ["beforeFileKey"],
            message: "Please upload before image",
            code: z.ZodIssueCode.custom,
          });
        }

        if (!hasAfter) {
          ctx.addIssue({
            path: ["afterFileKey"],
            message: "Please upload after image",
            code: z.ZodIssueCode.custom,
          });
        }
      } else {
        // ── Single ────────────────────────────────────────────────────────
        // Accept either a freshly-uploaded key OR a pre-existing URL (Edit mode)
        if (!data.fileKey && !data.fileUrl) {
          ctx.addIssue({
            path: ["fileKey"],
            message: "Please upload an image",
            code: z.ZodIssueCode.custom,
          });
        }
      }
    }

    /* ======================================================
     * STEP 2 – VIDEO
     * ====================================================== */
    if (data.contentType === "video") {
      if (!data.fileKey && !data.fileUrl) {
        ctx.addIssue({
          path: ["fileKey"], // UI Field Name
          message: "Please upload a video",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    /* ======================================================
     * STEP 2 – BLOG
     * ====================================================== */
    if (data.contentType === "blog") {
      if (!data.blogHeader?.trim()) {
        ctx.addIssue({
          path: ["blogHeader"],
          message: "Blog header is required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (
        !data.contentBody
          ?.replace(/<[^>]*>/g, "")
          .trim()
      ) {
        ctx.addIssue({
          path: ["contentBody"],
          message: "Blog content is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    /* ======================================================
     * STEP 2 – E-LEARNING
     * ====================================================== */
    if (data.contentType === "elearning") {
      if (!data.lessons || data.lessons.length === 0) {
        ctx.addIssue({
          path: ["lessons"],
          message: "At least one lesson is required",
          code: z.ZodIssueCode.custom,
        });
      }

      data.lessons?.forEach((lesson, index) => {
        if (!lesson.header?.trim()) {
          ctx.addIssue({
            path: ["lessons", index, "header"],
            message: "Lesson header is required",
            code: z.ZodIssueCode.custom,
          });
        }

        if (!lesson.title?.trim()) {
          ctx.addIssue({
            path: ["lessons", index, "title"],
            message: "Lesson title is required",
            code: z.ZodIssueCode.custom,
          });
        }

        if (!lesson.lessonFileKey && !lesson.existingFile) {
          ctx.addIssue({
            path: ["lessons", index, "lessonFileKey"], // UI Field Name
            message: "Lesson file is required",
            code: z.ZodIssueCode.custom,
          });
        }

        if (
          !lesson.contentBody
            ?.replace(/<[^>]*>/g, "")
            .trim()
        ) {
          ctx.addIssue({
            path: ["lessons", index, "contentBody"],
            message: "Lesson content is required",
            code: z.ZodIssueCode.custom,
          });
        }
      });
    }

    /* ======================================================
     * STEP 3 – COMMON REQUIRED FIELDS
     * ====================================================== */
    if (!data.contentTitle?.trim()) {
      ctx.addIssue({
        path: ["contentTitle"],
        message: "Content title is required",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.description?.trim()) {
      ctx.addIssue({
        path: ["description"],
        message: "Description is required",
        code: z.ZodIssueCode.custom,
      });
    }

    if (
      data.contentType !== "blog" &&
      !data.contentBody
        ?.replace(/<[^>]*>/g, "")
        .trim()
    ) {
      ctx.addIssue({
        path: ["contentBody"],
        message: "Content is required",
        code: z.ZodIssueCode.custom,
      });
    }

    /* ======================================================
     * STEP 3 – COVER IMAGE (ALWAYS REQUIRED)
     * ====================================================== */
    if (!data.coverImageKey && !data.coverImageUrl) {
      ctx.addIssue({
        path: ["coverImageKey"],
        message: "Cover image is required",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type CreateContentFormValues = z.infer<
  typeof CreateContentSchema
>;
