import { PallMallIconWithText } from "@/assets";
import {
  CommonIcon,
  CommonIconButton,
  EmptyStateLoader,
} from "@/components/common";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Radio,
  Rating,
  Slider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { useAdminApprovalForm } from "../hooks/formHooks/useAdminApprovalForm";
import { useState } from "react";
import { typography } from "@/theme/typography";

type Props = {
  formId: string | null;
  submitted_by: string | null;
  onClose: () => void;
  onResetButtonState?: () => void;
};

const dummyFormImage =
  "https://sapallmallmobileapp.blob.core.windows.net/mobile-app/user/90d3c2d0-9ea3-45ba-a102-35e868e54728/ContentUpload/blog.webp?sv=2026-02-06&st=2026-02-09T09%3A38%3A52Z&se=2026-02-09T10%3A38%3A52Z&sr=b&sp=r&sig=WsIQMQ9qYyS47UiMW6ZHS24ghTPmKbWRRXu98CyqWcg%3D";

const AdminApprovalFormView = ({
  formId,
  submitted_by,
  onClose,
  onResetButtonState,
}: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const { form, loading } = useAdminApprovalForm(formId, submitted_by);

  const renderAnswer = (q: any) => {
    const value = q.answer?.[0];
    if (!value) return "--";

    if (q.questionType === "date") {
      return dayjs(value).format("YYYY-MM-DD");
    }
    if (q.questionType === "datetime") {
      return dayjs(value).format("YYYY-MM-DD HH:mm");
    }
    if (q.questionType === "time") {
      // If it's a raw time string like HH:mm:ss, we might need special handling
      // but dayjs often handles it if we provide a dummy date
      return dayjs(`${dayjs().format("YYYY-MM-DD")} ${value}`).format("HH:mm");
    }

    return value;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // if (!form) return null;

  //  FORM EMPTY STATE
  if (!form) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: "auto",
          display: "flex",
          flexDirection: "column",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <EmptyStateLoader
          title="Form data not available"
          // subtitle="Unable to load submitted form"
          height={220}
          icon="FileX"
        />
        <Box
          sx={{
            p: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              width: 250,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </Box>
      </Paper>
    );
  }

  // const sortedAnswers = [...form.answers].sort(
  //   (a, b) => a.displayOrder - b.displayOrder,
  // );

  const answers = form.answers;

  return (
    <Paper
      elevation={0}
      sx={{
        height: isMobile ? "auto" : "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: theme.palette.primary.main,
          p: "17px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={PallMallIconWithText}
          alt="Pall Mall Logo"
          sx={{
            width: 94,
            height: 100,
            objectFit: "contain",
          }}
        />
      </Box>

      <Box
        // sx={{
        //   flex: 1,
        //   overflowY: "auto",
        //   px: 4,
        //   py: 3,
        //   maxWidth: 700,
        //   maxHeight: "1000px",
        //   width: "100%",
        //   mx: "auto",
        // }}
        sx={{
          flex: 1,
          overflowY: isMobile ? "visible" : "auto",
          px: isMobile ? 2 : 4, // Less padding on mobile to save space
          py: 3,
          maxWidth: isMobile ? "100%" : 700, // Let it fill the modal
          maxHeight: isMobile ? "none" : "1000px", // Remove the 1000px limit
          width: "100%",
          mx: "auto",
        }}
      >
        {(() => {
          let questionCount = 0; // FE-generated question number (per section)

          return answers.map((q) => {
            // -----------------------------
            // SECTION NODE
            // -----------------------------
            if (q.nodeType === "Section") {
              questionCount = 0; // reset numbering on new section

              return (
                <Box key={q.questionId} sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {q.question}
                  </Typography>
                </Box>
              );
            }

            // -----------------------------
            // QUESTION NODE
            // -----------------------------
            if (q.nodeType === "Question") {
              questionCount += 1;

              return (
                <Box key={q.questionId} sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" mb={2}>
                    {questionCount}. {q.question}
                  </Typography>

                  {[
                    "text",
                    "date",
                    "email",
                    "phone",
                    "textarea",
                    "number",
                    "datetime",
                    "time",
                  ].includes(q.questionType) && (
                    <Typography variant="body2">{renderAnswer(q)}</Typography>
                  )}

                  {q.questionType === "file" &&
                    (q.answer?.[0] ? (
                      !imageErrors[q.questionId] ? (
                        <Box
                          sx={{
                            mt: 1,
                            position: "relative",
                            width: "fit-content",
                            borderRadius: 1,
                            overflow: "hidden",
                            "&:hover > button": { opacity: 1 },
                          }}
                        >
                          <Box
                            component="img"
                            src={q.answer?.[0]}
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...prev,
                                [q.questionId]: true,
                              }))
                            }
                            sx={{
                              height: 100,
                              width: "auto",
                              borderRadius: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              display: "block",
                            }}
                          />
                          <CommonIconButton
                            size="small"
                            icon={<CommonIcon name="ExternalLink" size={16} />}
                            onClick={() => window.open(q.answer?.[0], "_blank")}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "rgba(0,0,0,0.5)",
                              color: "#fff",
                              opacity: 0,
                              transition: "opacity 0.2s",
                              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                            }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            mt: 1,
                            p: 1.5,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "error.light",
                            bgcolor: "error.light",
                            opacity: 0.8,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <CommonIcon
                            name="ImageOff"
                            size={16}
                            color={theme.palette.error.main}
                          />
                          <Typography
                            variant="caption"
                            color="error.main"
                            sx={{ fontWeight: 600 }}
                          >
                            Image not available
                          </Typography>
                        </Box>
                      )
                    ) : (
                      <Typography variant="button">
                        {" "}
                        Image not available
                      </Typography>
                    ))}

                  {/* RATING (VIEW ONLY) */}
                  {q.questionType === "rating" && (
                    <Rating
                      value={Number(q.answer?.[0] ?? 0)} // rating value from BE
                      max={5} // total 5 stars
                      readOnly // view-only mode
                      sx={{
                        // filled stars
                        "& .MuiRating-iconFilled": {
                          color: theme.palette.primary.main,
                        },
                        // empty star outline
                        "& .MuiRating-iconEmpty": {
                          color: "#000000",
                        },
                      }}
                    />
                  )}
                  {/* slider - view only */}
                  {q.questionType === "slider" && (
                    <Slider
                      value={Number(q.answer?.[0] ?? 0)}
                      min={1}
                      max={5}
                      step={1}
                      marks={[
                        { value: 1, label: "1" },
                        { value: 2, label: "2" },
                        { value: 3, label: "3" },
                        { value: 4, label: "4" },
                        { value: 5, label: "5" },
                      ]}
                      disabled
                      sx={{
                        height: 6,
                        "& .MuiSlider-track": {
                          backgroundColor: "primary.main",
                          border: "none",
                        },
                        "& .MuiSlider-rail": {
                          backgroundColor: "#e0e0e0",
                          opacity: 1,
                        },
                        "& .MuiSlider-thumb": {
                          width: 22,
                          height: 22,
                          backgroundColor: "#cfcfcf",
                        },
                        "& .MuiSlider-mark": {
                          backgroundColor: "transparent", // keep marks logically
                        },
                        "& .MuiSlider-markLabel": {
                          mt: 1,
                          fontSize: 14,
                          color: "#000",
                          opacity: 1, // IMPORTANT for disabled
                        },
                        "&.Mui-disabled": {
                          color: "#000", // prevents greyed text
                        },
                      }}
                    />
                  )}
                  {["radio", "select"].includes(q.questionType) &&
                    q.options?.map((opt) => (
                      <FormControlLabel
                        key={opt}
                        control={
                          <Radio
                            checked={q.answer?.includes(opt)}
                            disabled
                            sx={{
                              color: "#000000", // ring (unchecked)
                              "&.Mui-checked": {
                                color: theme.palette.primary.main, // checked dot
                              },
                              "&.Mui-disabled": {
                                color: "#000000", // ring when disabled
                              },
                              "&.Mui-disabled.Mui-checked": {
                                color: theme.palette.primary.main, // checked dot when disabled
                              },
                            }}
                          />
                        }
                        label={<Typography variant="button">{opt}</Typography>}
                      />
                    ))}

                  {q.questionType === "checkbox" &&
                    q.options?.map((opt) => (
                      <FormControlLabel
                        key={opt}
                        control={
                          <Checkbox
                            checked={q.answer?.includes(opt)}
                            disabled
                            sx={{
                              color: "#000000", // box outline
                              "&.Mui-checked": {
                                color: theme.palette.primary.main, // tick
                              },
                              "&.Mui-disabled": {
                                color: "#000000", // outline when disabled
                              },
                              "&.Mui-disabled.Mui-checked": {
                                color: theme.palette.primary.main, // tick when disabled
                              },
                            }}
                          />
                        }
                        label={<Typography variant="button">{opt}</Typography>}
                      />
                    ))}
                </Box>
              );
            }

            // -----------------------------
            // IGNORE OTHER NODE TYPES (for now)
            // -----------------------------
            return null;
          });
        })()}
      </Box>

      <Box
        sx={{
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Button
          variant="contained"
          onClick={() => {
            onResetButtonState?.();
            onClose();
          }}
          sx={{
            width: 250,
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            fontWeight: 600,
            borderRadius: 2,
            py: 1.2,
            textTransform: "none",
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          Close
        </Button>
      </Box>
    </Paper>
  );
};

export default AdminApprovalFormView;
