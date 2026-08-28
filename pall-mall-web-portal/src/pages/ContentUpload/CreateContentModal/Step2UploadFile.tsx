// Step2UploadFile.tsx
import { BaseSelect, CommonIcon } from "@/components/common";
import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";

import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { SelectOption } from "@/types/select";
import { SUPPORTED_FORMATS } from "./Step2UploadFile/uploadHandlers";
import { useFilePreview } from "./Step2UploadFile/previewHooks";
import ElearningLessonsSection from "./Step2UploadFile/ElearningLessonsSection";
import BlogSection from "./Step2UploadFile/BlogSection";
import SingleFileUpload from "./Step2UploadFile/SingleFileUpload";
import MultipleImageUpload from "./Step2UploadFile/MultipleImageUpload";
import PreviewSection from "./Step2UploadFile/PreviewSection";

interface Props {
  form: any;
}

const Step2UploadFile = ({ form }: Props) => {
  const { control, watch, formState, setError } = form;

  const contentType = form.watch("contentType");

  const fileUrl = form.watch("fileUrl");
  const beforeFileUrl = form.watch("beforeFileUrl");
  const afterFileUrl = form.watch("afterFileUrl");

  //  Bridge before image
  useEffect(() => {
    const err = formState.errors.beforeFileKey;
    if (err) {
      setError("beforeFile", {
        type: "manual",
        message: err.message as string,
      });
    }
  }, [formState.errors.beforeFileKey]);

  //  Bridge after image
  useEffect(() => {
    const err = formState.errors.afterFileKey;
    if (err) {
      setError("afterFile", {
        type: "manual",
        message: err.message as string,
      });
    }
  }, [formState.errors.afterFileKey]);

  const singleInputRef = useRef<HTMLInputElement | null>(null);

  const beforeFile = form.watch("beforeFile");
  const afterFile = form.watch("afterFile");

  const watchedFile = form.watch("file");
  const imageMode = form.watch("imageMode");
  const fileKey = form.watch("fileKey");
  const beforeFileKey = form.watch("beforeFileKey");
  const afterFileKey = form.watch("afterFileKey");

  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);

  const config = SUPPORTED_FORMATS[contentType] ?? SUPPORTED_FORMATS.image;

  const acceptString = config.accept.join(",");

  // const { options: imageModeOptions } = useDropdown(
  //   DropdownType.IMAGE_COUNT,
  //   false,
  // );


  // const selectedImageMode = imageModeOptions.find(
  //   (opt) => opt.value === imageMode,
  // );


  const IMAGE_MODE_OPTIONS: SelectOption[] = [
    { label: "Single", value: 87 },
    { label: "Multiple", value: 88 },
  ];


  const selectedImageMode = IMAGE_MODE_OPTIONS.find(
    (opt) => opt.value === imageMode,
  );

  const isMultiple = selectedImageMode?.label
    ?.toLowerCase()
    .includes("multiple");

  const isSingle = selectedImageMode?.label?.toLowerCase().includes("single");

  //  Bridge single file (image / video)
  //  DO NOT run this in MULTIPLE image mode
  useEffect(() => {
    if (contentType === "image" && isMultiple) return;

    const err = formState.errors.fileKey;
    if (err) {
      setError("file", {
        type: "manual",
        message: err.message as string,
      });
    } else {
      //  important: clear stale single-file error
      form.clearErrors("file");
    }
  }, [formState.errors.fileKey, contentType, isMultiple]);

  // console.group(" STEP 2 IMAGE MODE DEBUG");
  // console.log("contentType:", contentType);
  // console.log("imageMode value:", imageMode);
  // console.log("imageModeOptions:", imageModeOptions);
  // console.log("selectedImageMode:", selectedImageMode);
  // console.log("isSingle:", isSingle);
  // console.log("isMultiple:", isMultiple);
  // console.groupEnd();

  // useEffect(() => {
  //   if (!previewOpen) return;

  //   console.group("FULLSCREEN PREVIEW DEBUG");
  //   console.log("contentType:", contentType);
  //   console.log("activeFile:", activeFile);
  //   console.log("activeFile?.type:", activeFile?.type);
  //   console.log("activePreviewUrl:", activePreviewUrl);
  //   console.log("isVideoPreview:", isVideoPreview);
  //   console.log("isImagePreview:", isImagePreview);
  //   console.groupEnd();
  // }, [previewOpen]);

  //  SINGLE FILE PREVIEW
  const previewUrl = useFilePreview(watchedFile);

  //  BEFORE IMAGE PREVIEW
  useEffect(() => {
    if (beforeFile instanceof File) {
      const url = URL.createObjectURL(beforeFile);
      setBeforePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setBeforePreview(null);
  }, [beforeFile]);

  console.log({
    imageMode,
    fileUrl,
    beforeFileUrl,
    afterFileUrl,
  });

  //  AFTER IMAGE PREVIEW
  useEffect(() => {
    if (afterFile instanceof File) {
      const url = URL.createObjectURL(afterFile);
      setAfterPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setAfterPreview(null);
  }, [afterFile]);

  //  Default imageMode to "Single" 
  useEffect(() => {
    if (contentType === "image" && !imageMode) {
      form.setValue("imageMode", 87);
    }
  }, [contentType, imageMode]);

  // ── Mode-bleed fix ──────────────────────────────────────────────────────────
  // When the user switches BACK to Single, the Multiple-mode fields
  // (beforeFileKey / afterFileKey / beforeFile / afterFile) are still in the
  // RHF store.  Zod's superRefine checks `hasBefore || hasAfter` and, finding
  // stale data, enters the Before/After branch and raises an error about the
  // missing half — which bleeds into the Single uploader as a phantom error.
  // Fix: the moment isSingle is true, wipe those four fields + their errors so
  // the next Zod run sees clean state.
  useEffect(() => {
    if (!isSingle) return;

    form.setValue("beforeFile", undefined, { shouldValidate: false });
    form.setValue("afterFile", undefined, { shouldValidate: false });
    form.setValue("beforeFileKey", null, { shouldValidate: false });
    form.setValue("afterFileKey", null, { shouldValidate: false });

    form.clearErrors(["beforeFile", "afterFile", "beforeFileKey", "afterFileKey"]);
  }, [isSingle]);

  // When switching TO Multiple, wipe Single-mode fields so that stale
  // fileKey / file values don't linger and produce phantom Single errors
  // inside the Multiple panel (the "Please upload an image" bleed).
  useEffect(() => {
    if (!isMultiple) return;

    form.setValue("file", undefined, { shouldValidate: false });
    form.setValue("fileKey", null, { shouldValidate: false });

    form.clearErrors(["file", "fileKey"]);
  }, [isMultiple]);


  // STEP 2 – E-LEARNING LESSON INPUT

  if (contentType === "elearning") {
    return <ElearningLessonsSection form={form} />;
  }

  // ================= BLOG CONTENT  =================
  if (contentType === "blog") {
    return <BlogSection form={form} />;
  }


  const shouldDisableImageMode = Boolean(
    watchedFile ||
    fileKey ||
    fileUrl ||
    beforeFile ||
    beforeFileKey ||
    beforeFileUrl ||
    afterFile ||
    afterFileKey ||
    afterFileUrl,
  );


  return (
    <Controller
      name="file"
      control={form.control}
      render={({ field, fieldState }) => {
        const file = field.value as File | null;

        return (
          <Box>
            <Typography sx={{ mb: 1.5 }} color="text.primary" variant="body1">
              {contentType === "video" ? "Upload Video" : "Upload Image"}
            </Typography>

            {/* ================= IMAGE MODE SELECT ================= */}
            {contentType === "image" && (
              <Controller
                name="imageMode"
                control={form.control}
                render={({ field }) => (
                  <BaseSelect
                    sx={{
                      mb: 2,
                      // ...(Boolean(watchedFile || fileKey || fileUrl || beforeFile || beforeFileKey
                      //    || beforeFileUrl || afterFile || afterFileKey || afterFileUrl) && {
                      //   opacity: 0.6,
                      //   pointerEvents: "none"
                      // })
                    }}
                    disabled={shouldDisableImageMode}
                    placeholder="Image Type"
                    name={field.name}
                    value={
                      // imageModeOptions.find(
                      IMAGE_MODE_OPTIONS.find(
                        (opt) => opt.value === field.value,
                      ) || null
                    }
                    onChange={(newValue: SelectOption | null) => {
                      if (Boolean(watchedFile || fileKey || fileUrl || beforeFile || beforeFileKey
                        || beforeFileUrl || afterFile || afterFileKey || afterFileUrl)) return;
                      field.onChange(newValue?.value ?? null);
                    }}
                    // options={imageModeOptions}
                    options={IMAGE_MODE_OPTIONS}

                  />
                )}
              />
            )}

            {(contentType !== "image" || isSingle) && (
              <SingleFileUpload
                form={form}
                field={field}
                fieldState={fieldState}
                config={config}
                acceptString={acceptString}
                contentType={contentType}
              />
            )}

            {/* ================= MULTIPLE IMAGE UPLOAD ================= */}

            {contentType === "image" && isMultiple && (
              <MultipleImageUpload
                form={form}
                config={config}
                acceptString={acceptString}
              />
            )}

            {/* ================= PREVIEW  ================= */}
            {!(
              contentType === "video" &&
              fileUrl &&
              (fileUrl.includes("youtube.com") ||
                fileUrl.includes("youtu.be") ||
                fileUrl.includes("vimeo.com"))
            ) && (
                <PreviewSection
                  file={file}
                  fileUrl={fileUrl}
                  previewUrl={previewUrl}
                  beforeFile={beforeFile}
                  afterFile={afterFile}
                  beforePreview={beforePreview}
                  afterPreview={afterPreview}
                  beforeFileUrl={beforeFileUrl}
                  afterFileUrl={afterFileUrl}
                  contentType={contentType}
                  isSingle={isSingle}
                  isMultiple={isMultiple}
                  form={form}
                  singleInputRef={singleInputRef}
                />
              )}

            {fieldState.error && (
              <Typography
                variant="body2"
                sx={{ color: "error.main", mt: 1, ml: 0.5 }}
              >
                {fieldState.error.message}
              </Typography>
            )}
          </Box>
        );
      }}
    />
  );
};

export default Step2UploadFile;
