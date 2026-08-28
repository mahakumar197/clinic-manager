// ElearningLessonsSection.tsx
import {
  CommonButton,
  CommonIcon,
  CommonIconButton,
} from "@/components/common";
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";

import { CommonTextField, RichTextEditor } from "@/components/common";
import { useFileUpload } from "@/hooks/useFileUpload";
import { toast } from "@/utils/toast";
import { CheckCircle } from "@mui/icons-material";
import { useFieldArray } from "react-hook-form";
import { SUPPORTED_FORMATS } from "./uploadHandlers";

interface Props {
  form: any;
}

const ElearningLessonsSection = ({ form }: Props) => {
  const theme = useTheme();

  const { uploadFile } = useFileUpload();
  const [uploadingLessonIndex, setUploadingLessonIndex] = useState<
    number | null
  >(null);

  const { control, watch, formState, setError } = form;

  useEffect(() => {
    const lessonErrors = formState.errors.lessons;
    // if (!lessonErrors) return;
    if (!Array.isArray(lessonErrors)) return;

    lessonErrors.forEach((err: any, index: number) => {
      if (err?.lessonFileKey) {
        setError(`lessons.${index}.file`, {
          type: "manual",
          message: err.lessonFileKey.message as string,
        });
      }
    });
  }, [formState.errors.lessons, setError]);

  const lessonRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lessons",
  });

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const lessons = watch("lessons");
  const contentBodies = watch("lessons").map(l => l?.contentBody);

  useEffect(() => {
    if (!fields.length) return;

    const lastIndex = fields.length - 1;
    lessonRefs.current[lastIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [fields.length]);


  // completion logic
  const isLessonCompleted = (lesson: any) => {
    if (!lesson) return false;

    const hasHeader = lesson.header?.trim();
    const hasTitle = lesson.title?.trim();
    const hasFile = !!lesson.lessonFileKey || lesson.existingFile === true;

    const hasContent = lesson.contentBody?.replace(/<[^>]*>/g, "").trim();

    return Boolean(hasHeader && hasTitle && hasFile && hasContent);
  };


  const handleAddLesson = async () => {
    const allLessons = lessons || [];

    const firstInvalidIndex = allLessons.findIndex(
      (lesson: any) => !isLessonCompleted(lesson)
    );

    if (firstInvalidIndex !== -1) {
      // Set top error (your existing behavior)
      form.setError("lessons", {
        type: "manual",
        message: "Please complete all lessons before adding a new one",
      });
      await form.trigger([
        `lessons.${firstInvalidIndex}.header`,
        `lessons.${firstInvalidIndex}.title`,
        `lessons.${firstInvalidIndex}.lessonFileKey`,
        `lessons.${firstInvalidIndex}.contentBody`,
      ]);

      const fileKeyError = form.getFieldState(
        `lessons.${firstInvalidIndex}.lessonFileKey`
      ).error;
      if (fileKeyError) {
        form.setError(`lessons.${firstInvalidIndex}.file`, {
          type: fileKeyError.type,
          message: fileKeyError.message,
        });
      }
      lessonRefs.current[firstInvalidIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    form.clearErrors("lessons");

    append({
      header: "",
      title: "",
      file: null,
      lessonFileKey: null,
      contentBody: "",
    });
  };



  useEffect(() => {
    const allLessons = lessons || [];

    const hasIncompleteLesson = allLessons.some(
      (lesson: any) => !isLessonCompleted(lesson)
    );

    if (!hasIncompleteLesson) {
      form.clearErrors("lessons");
    }
  }, [contentBodies]);




  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* ================= Header ================= */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body1">Uploaded Lessons</Typography>

        <CommonButton
          variant="outlined"
          endIcon={<CommonIcon name="CirclePlus" size={20} />}
          onClick={handleAddLesson}
        >
          Add Lesson
        </CommonButton>
      </Box>
      {form.formState.errors.lessons?.message && (
        <Typography variant="body2" color="error.main">
          {form.formState.errors.lessons.message}
        </Typography>
      )}

      {/* ================= Lessons ================= */}
      {fields.map((lesson, index) => {
        const completed = isLessonCompleted(lessons?.[index]);

        return (
          <Box
            key={lesson.id}
            ref={(el: HTMLDivElement | null) => {
              lessonRefs.current[index] = el;
            }}
          >
            <Paper key={lesson.id} elevation={0}>
              {/*  Lesson Header  */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {completed && (
                    <CheckCircle
                      sx={{
                        color: "primary.main",
                        fontSize: 20,
                      }}
                    />
                  )}

                  <Typography
                    variant="body2"
                    color={completed ? "primary.main" : "text.primary"}
                  >
                    Lesson {index + 1}
                  </Typography>
                </Box>

                {fields.length > 1 && (
                  <CommonIconButton
                    onClick={() => remove(index)}
                    icon={
                      <CommonIcon
                        name="Trash2"
                        size={18}
                        color={theme.palette.error.main}
                      />
                    }
                  />
                )}
              </Box>

              {/* ---------- Lesson Header Input ---------- */}
              <Controller
                name={`lessons.${index}.header`}
                control={control}
                render={({ field, fieldState }) => (
                  <CommonTextField
                    label="Header *"
                    fullWidth
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              {/* ---------- Lesson Title Input ---------- */}
              <Controller
                name={`lessons.${index}.title`}
                control={control}
                render={({ field, fieldState }) => (
                  <CommonTextField
                    label="Content Title *"
                    fullWidth
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              {/* ---------- Upload File ---------- */}
              <Controller
                name={`lessons.${index}.file`}
                control={control}
                render={({ field, fieldState }) => (
                  <CommonTextField
                    label="Upload File *"
                    value={
                      field.value?.name || lessons?.[index]?.fileName || ""
                    }
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onClick={() => {
                      if (
                        !lessons?.[index]?.lessonFileKey &&
                        uploadingLessonIndex !== index
                      ) {
                        fileInputRefs.current[index]?.click();
                      }
                    }}
                    InputProps={{
                      readOnly: true,
                      inputProps: {
                        style: { cursor: "pointer" },
                      },

                      endAdornment: (
                        <IconButton
                          // component="label"
                          size="small"
                          onClick={
                            lessons?.[index]?.lessonFileKey
                              ? (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  field.onChange(null);
                                  form.setValue(
                                    `lessons.${index}.existingFile`,
                                    false,
                                  );
                                  form.setValue(
                                    `lessons.${index}.existingContentUrl`,
                                    null,
                                  );
                                  form.setValue(
                                    `lessons.${index}.fileName`,
                                    "",
                                  );

                                  form.setValue(
                                    `lessons.${index}.lessonFileKey`,
                                    null,
                                    { shouldDirty: true, shouldValidate: true },
                                  );
                                  setTimeout(() => {
                                    const keyErr = form.getFieldState(
                                      `lessons.${index}.lessonFileKey`,
                                    ).error;
                                    if (keyErr) {
                                      form.setError(`lessons.${index}.file`, {
                                        type: keyErr.type,
                                        message: keyErr.message,
                                      });
                                    }
                                  }, 0);
                                }
                              : undefined
                          }
                        >
                          {uploadingLessonIndex === index ? (
                            <CircularProgress size={16} />
                          ) : lessons?.[index]?.lessonFileKey ? (
                            <CommonIcon name="Trash2" size={16} color="red" />
                          ) : (
                            <CommonIcon name="Upload" size={16} />
                          )}
                          {!lessons?.[index]?.lessonFileKey && (
                            <input
                              ref={(el) => {
                                fileInputRefs.current[index] = el;
                              }}
                              type="file"
                              hidden
                              accept={SUPPORTED_FORMATS.elearning.accept.join(
                                ",",
                              )}
                              onChange={async (e) => {
                                const f = e.target.files?.[0] || null;
                                if (!f) return;

                                if (
                                  !SUPPORTED_FORMATS.elearning.accept.includes(
                                    f.type,
                                  )
                                ) {
                                  form.setError(`lessons.${index}.file`, {
                                    type: "manual",
                                    message: "Only video files are allowed",
                                  });
                                  return;
                                }

                                field.onChange(f);
                                setUploadingLessonIndex(index);

                                try {
                                  const { key } = await uploadFile(
                                    f,
                                    "ELearning",
                                  );
                                  form.setValue(
                                    `lessons.${index}.lessonFileKey`,
                                    key,
                                    {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    },
                                  );
                                  form.clearErrors(`lessons.${index}.file`);
                                  toast.success(
                                    `Lesson ${index + 1} file uploaded successfully`,
                                  );
                                } catch (err) {
                                  toast.error(
                                    `Lesson ${index + 1} file upload failed`,
                                  );
                                  console.error("Lesson upload error:", err);
                                  form.setError(`lessons.${index}.file`, {
                                    type: "manual",
                                    message: "Lesson file upload failed",
                                  });
                                } finally {
                                  setUploadingLessonIndex(null);
                                }
                              }}
                            />
                          )}
                        </IconButton>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      cursor: lessons?.[index]?.lessonFileKey
                        ? "default"
                        : "pointer",
                    }}
                  />
                )}
              />

              {/* ---------- Lesson Content ---------- */}
              <Controller
                name={`lessons.${index}.contentBody`}
                control={control}
                render={({ field, fieldState }) => (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      Lesson Content *
                    </Typography>

                    <RichTextEditor
                      value={field.value || ""}
                      // onChange={field.onChange}
                      onChange={(val) => {
                        field.onChange(val);
                        // form.trigger("lessons");
                      }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  </Box>
                )}
              />
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
};

export default ElearningLessonsSection;
