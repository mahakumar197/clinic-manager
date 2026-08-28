// CreateContentModal.tsx
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Stepper, BaseModal } from "@/components/common";
import { useStepController } from "@/hooks/useStepController";
import Step1ContentType from "./Step1ContentType";
import Step2UploadFile from "./Step2UploadFile";
import Step3ContentDetails from "./Step3ContentDetails";
import { CreateContentSchema, CreateContentFormValues } from "./ContentSchema";
import { useCreateContent } from "../hooks/useCreateContent";
import { toast } from "@/utils/toast";
import { contentService } from "@/services/modules/content.service";

const createSteps = ["Select Content Type", "Upload File", "Content Details"];
const editSteps = ["Upload File", "Content Details"];

interface Props {
  open: boolean;
  onClose: () => void;
  procedureId: string; // UUID
  procedureTitle?: string;
  mode?: "create" | "edit";
  contentId?: string | null;
  onSuccess?: () => void;
}

const CreateContentModal = ({
  open,
  onClose,
  procedureId,
  procedureTitle,
  mode = "create",
  contentId,
  onSuccess,
}: Props) => {
  const form = useForm<CreateContentFormValues>({
    resolver: zodResolver(CreateContentSchema),
    mode: "onChange",
    shouldUnregister: false,

    defaultValues: {
      contentType: null,
      imageMode: null,

      fileKey: null,
      fileUrl: null,

      beforeFileKey: null,
      beforeFileUrl: null,

      afterFileKey: null,
      afterFileUrl: null,

      coverImageKey: null,
      coverImageUrl: null,

      coverImageName: "",

      lessons: [
        {
          header: "",
          title: "",
          fileKey: null,
          fileUrl: null,
          contentBody: "",
        },
      ],

      contentTitle: "",
      description: "",
      contentBody: "",
      blogHeader: "",
      publishImmediately: false,
    },
  });

  const steps = mode === "edit" ? editSteps : createSteps;

  const { createContent, loading } = useCreateContent({
    procedureId,
  });

  const { trigger, handleSubmit, reset, watch } = form;

  const contentType = watch("contentType");

  const prevContentType = useRef<string | null>(null);


  useEffect(() => {
    if (!contentType) return;

    if (prevContentType.current === null) {
      prevContentType.current = contentType;
      return;
    }

    if (prevContentType.current !== contentType) {
      const resetFields = [
        "file",
        "fileKey",
        "fileUrl",
        "contentUrl",
        "beforeFile",
        "afterFile",
        "beforeFileKey",
        "afterFileKey",
        "contentTitle",
        "description",
        "contentBody",
        "coverImageKey",
        "blogHeader",
        "coverImageName",
        "coverImageUrl",
        "lessons"
      ];

      resetFields.forEach((field) => {
        if (field === "lessons") {
          form.setValue("lessons", [
            {
              header: "",
              title: "",
              fileKey: null,
              fileUrl: null,
              contentBody: "",
            },
          ]);
          return;
        }
        const stringFields = [
          "contentTitle",
          "description",
          "contentBody",
          "blogHeader",
          "coverImageName",
        ];

        form.setValue(field as any, stringFields.includes(field) ? "" : null, {
          shouldDirty: false,
        });
      });


      form.clearErrors();
    }

    prevContentType.current = contentType;
  }, [contentType]);


  const validateStep = async (stepIndex: number) => {
    // ---------- EDIT MODE ----------
    if (mode === "edit") {
      if (stepIndex === 0) {
        // Edit Step 1 = Upload File
        if (contentType === "elearning") {
          return await trigger(["lessons"]);
        }

        if (contentType === "blog") {
          return await trigger(["contentBody"]);
        }

        if (contentType === "image") {
          const currentImageMode = watch("imageMode");
          if (currentImageMode === 88) {
            // Multiple mode — require both before + after
            return await trigger(["beforeFileKey", "afterFileKey"]);
          }
          // Single mode
          return await trigger(["fileKey"]);
        }

        return await trigger(["fileKey"]);
      }

      if (stepIndex === 1) {
        return await trigger([
          "contentTitle",
          "description",
          "contentBody",
          "coverImageKey",
          "blogHeader",
        ]);
      }

      return true;
    }

    if (stepIndex === 0) {
      return await trigger(["contentType"]);
    }
    // ---------- CREATE MODE ----------
    if (stepIndex === 1) {
      if (contentType === "elearning") {
        return await trigger(["lessons"]);
      }

      if (contentType === "blog") {
        return await trigger(["contentBody"]);
      }

      if (contentType === "image") {
        const currentImageMode = watch("imageMode");
        if (currentImageMode === 88) {
          // Multiple mode — require both before + after
          return await trigger(["beforeFileKey", "afterFileKey"]);
        }
        // Single mode
        return await trigger(["fileKey"]);
      }
      return await trigger(["fileKey"]);
    }

    if (stepIndex === 2) {
      return await trigger([
        "contentTitle",
        "description",
        "contentBody",
        "coverImageKey",
        "blogHeader",
      ]);
    }

    return true;
  };

  const { step, nextStep, prevStep, resetStep, isLastStep } = useStepController(
    {
      totalSteps: steps.length,
      validateStep,
    },
  );

  useEffect(() => {
    if (!open) {
      reset();
      resetStep();
    }
  }, [open]);

  useEffect(() => {
    if (mode !== "edit" || !contentId || !open) return;

    const loadContent = async () => {
      const content = await contentService.getContentById(contentId);

      const mappedLessons =
        content.eLearnings && typeof content.eLearnings === "object"
          ? Object.values(content.eLearnings).map((lesson: any) => {
            const key = lesson.content_Url ?? null;

            return {
              header: lesson.headertitle ?? "",
              title: lesson.title ?? "",

              lessonFileKey: key,
              fileUrl: lesson.contentUrl ?? null,
              fileName: key ? key.split("/").pop() : "",

              contentBody: lesson.lessoncontent ?? "",

              existingFile: !!key,

              existingContentUrl: lesson.contentUrl ?? null,
            };
          })
          : [];

      const thumbnailKey = content.thumbnailUrl || null;

      const coverImageName = thumbnailKey
        ? thumbnailKey.split("/").pop()?.split("?")[0]
        : "";

      form.reset({
        contentType: content.type,
        contentTitle: content.title,
        description: content.description ?? "",
        contentBody: content.content ?? "",
        blogHeader: content.blogHeader ?? "",
        imageMode: content.img_count || content.imgCount || null,
        publishImmediately: content.status === "published",
        fileKey: content.content_key?.[0] ?? null,
        fileUrl: content.video_url || content.img_urls?.url_single || null,
        beforeFileUrl: content.img_urls?.url_before ?? null,
        afterFileUrl: content.img_urls?.url_after ?? null,

        beforeFileKey: null,
        afterFileKey: null,

        coverImageKey: content.thumbnailUrl ?? null,
        coverImageUrl: content.thumbnail ?? null,

        coverImageName,

        lessons: mappedLessons,
      });

      resetStep();
    };

    loadContent();
  }, [mode, contentId, open]);

  const onSubmit = async (data: CreateContentFormValues) => {

    console.log(" SUBMIT DATA:", data);
    try {
      const success = await createContent(data, contentId);

      if (success) {
        toast.success(
          mode === "edit"
            ? "Content updated successfully"
            : "Content created successfully",
        );
        onSuccess?.();
        onClose();
      } else {
        // createContent returned false (handled error internally)
        console.error("Create/Update content failed (returned false)");
        toast.error("Failed to save content");
      }
    } catch (error) {
      // unexpected crashes
      console.error("onSubmit error:", error);
      toast.error("Something went wrong while saving content");
    }
  };

  const renderStepContent = () => {
    if (mode === "edit") {
      if (step === 0) return <Step2UploadFile form={form} />;
      if (step === 1)
        return (
          <Step3ContentDetails form={form} procedure={procedureTitle ?? ""} />
        );
      return null;
    }
    if (step === 0) return <Step1ContentType form={form} />;
    if (step === 1) return <Step2UploadFile form={form} />;
    if (step === 2)
      return (
        <Step3ContentDetails form={form} procedure={procedureTitle ?? ""} />
      );
    return null;
  };

  const subtitle = `Step ${step + 1} of ${steps.length}: ${steps[step]}`;

  useEffect(() => {
    console.log(" FORM VALID:", form.formState.isValid);
    console.log(" FORM ERRORS:", form.formState.errors);
  }, [form.formState]);

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit Content" : "Add Content"}
      subtitle={procedureTitle}
      onBack={step === 0 ? onClose : prevStep}
      onNext={isLastStep ? handleSubmit(onSubmit) : nextStep}
      backLabel={step === 0 ? "Cancel" : "Back"}
      nextLabel={isLastStep ? "Upload Content" : "Next"}
      headerContent={
        <Stepper steps={steps} activeStep={step} variant="circle" />
      }
      loading={loading}
    >
      <Box mt={1}>{renderStepContent()}</Box>
    </BaseModal>
  );
};

export default CreateContentModal;
