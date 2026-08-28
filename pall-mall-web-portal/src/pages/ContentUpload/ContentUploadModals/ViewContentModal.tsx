import {
  CommonButton,
  CommonIcon,
  CommonIconButton,
  CommonImage,
  Modal,
} from "@/components/common";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { DATE_FORMATS } from "@/constants";
import { contentService } from "@/services/modules/content.service";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { JSX, useEffect, useState } from "react";

/* -------------------- DUMMY FALLBACKS -------------------- */
const DUMMY_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

const DUMMY_IMAGE =
  "https://images.pexels.com/photos/7089619/pexels-photo-7089619.jpeg";

const DUMMY_BEFORE =
  "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg";

const DUMMY_AFTER =
  "https://images.pexels.com/photos/7581575/pexels-photo-7581575.jpeg";

const DUMMY_LESSON_VIDEOS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
];

/* -------------------- TYPE STYLES (MATCH CONTENT LIBRARY) -------------------- */
const TYPE_STYLES: Record<
  string,
  { bg: string; color: string; icon: JSX.Element }
> = {
  video: {
    bg: "#DBEAFE",
    color: "#1D4ED8",
    icon: <CommonIcon name="Video" color="#1D4ED8" />,
  },
  image: {
    bg: "#F3E8FF",
    color: "#7C3AED",
    icon: <CommonIcon name="Image" color="#7C3AED" />,
  },
  blog: {
    bg: "#DCFCE7",
    color: "#15803D",
    icon: <CommonIcon name="FileText" color="#15803D" />,
  },
  elearning: {
    bg: "#FEF3C6",
    color: "#B45309",
    icon: <CommonIcon name="GraduationCap" color="#B45309" />,
  },
};

interface ContentViewModalProps {
  open: boolean;
  onClose: () => void;
  contentId: string | null;

  contentType?: "blog" | "video" | "image" | "elearning";

  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ContentViewModal = ({
  open,
  onClose,
  contentId,
  contentType,
  onEdit,
  onDelete,
}: ContentViewModalProps) => {
  const theme = useTheme();
  const [content, setContent] = useState<any | null>(null);
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  useEffect(() => {
    if (open) {
      setActiveLesson(null);
    }
  }, [open, contentId]);

  // useEffect(() => {
  //   if (!open || !contentId) return;

  //   setContent(null);

  //   contentService
  //     .getContentById(contentId)
  //     .then(setContent)
  //     .catch((err) => {
  //       console.error("Failed to fetch content", err);
  //     });
  // }, [open, contentId]);

  useEffect(() => {
    if (!open || !contentId) return;

    setContent(null);

    contentService
      .getContentById(contentId)
      .then((res) => {
        console.group(" CONTENT API RESPONSE");
        console.log("FULL RESPONSE:", res);
        console.log("content.type:", res?.type);
        console.log("content.contentUrl:", res?.content_url);
        console.log("content.thumbnailUrl:", res?.thumbnail_url);
        console.log("content.thumbnail:", res?.thumbnail);

        if (res.type === "elearning") {
          console.group("🎓 E-LEARNING DATA");

          const lessons = res.eLearnings ?? {};
          const lessonKeys = Object.keys(lessons);

          console.log("Total Lessons:", lessonKeys.length);

          lessonKeys.forEach((key, index) => {
            const lesson = lessons[key];

            console.groupCollapsed(`📘 Lesson ${index + 1} (${key})`);
            console.log("Header Title:", lesson.headertitle);
            console.log("Title:", lesson.title);
            console.log("Content URL:", lesson.contentUrl);
            console.log("Lesson Content:", lesson.lessoncontent);
            console.groupEnd();
          });

          console.groupEnd();
        }
        console.log("contentUrl is array:", Array.isArray(res?.content_url));
        console.log(
          "contentUrl length:",
          Array.isArray(res?.content_url) ? res.content_url.length : "N/A",
        );
        console.groupEnd();

        setContent(res);
      })
      .catch((err) => {
        console.error(" Failed to fetch content", err);
      });
  }, [open, contentId]);

  const isBlog = contentType === "blog";

  if (!content) {
    return (
      <Modal open={open} onClose={onClose} maxWidth={isBlog ? "md" : "sm"}>
        <CommonSkeleton type="contentViewModal" />
      </Modal>
    );
  }

  const type = content.type;
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.blog;

  /* ---------------- E-LEARNING NORMALIZATION ---------------- */
  const eLearningLessons =
    type === "elearning" && content.eLearnings
      ? Object.values(content.eLearnings)
      : [];

  /* -------- NORMALIZE BACKEND content_url -------- */

  // const rawContentUrl = content.content_url;

  /* -------- BLOG THUMBNAIL NORMALIZATION -------- */
  const blogThumbnailSrc =
    content?.thumbnail && !content.thumbnail.startsWith("blob:")
      ? content.thumbnail
      : content?.thumbnail_url && !content.thumbnail_url.startsWith("blob:")
        ? content.thumbnail_url
        : DUMMY_IMAGE;

  /**
   * media = {
   *   single?: string
   *   before?: string
   *   after?: string
   * }
   */
  const media: {
    single?: string;
    before?: string;
    after?: string;
  } = {};

  // For video content, check video_url first
  if (type === "video" && content.video_url) {
    media.single = content.video_url;
  }
  // Map from img_urls object structure for images
  else if (content.img_urls) {
    media.single = content.img_urls.url_single;
    media.before = content.img_urls.url_before;
    media.after = content.img_urls.url_after;
  }
  // Fallback to old content_url structure for backward compatibility
  else if (content.content_url) {
    const rawContentUrl = content.content_url;
    if (Array.isArray(rawContentUrl)) {
      rawContentUrl.forEach((url: string) => {
        if (url.startsWith("before:")) {
          media.before = url.replace("before:", "");
        } else if (url.startsWith("after:")) {
          media.after = url.replace("after:", "");
        } else {
          media.single = url;
        }
      });
    } else if (typeof rawContentUrl === "string") {
      media.single = rawContentUrl;
    }
  }

  const imageSrc =
    media.single && !media.single.startsWith("blob:")
      ? media.single
      : DUMMY_IMAGE;

  const beforeImageSrc =
    media.before && !media.before.startsWith("blob:")
      ? media.before
      : DUMMY_BEFORE;

  const afterImageSrc =
    media.after && !media.after.startsWith("blob:") ? media.after : DUMMY_AFTER;

  const videoSrc =
    media.single && !media.single.startsWith("blob:")
      ? media.single
      : DUMMY_VIDEO;

  const getLessonVideoSrc = (lesson: any, index: number) => {
    if (lesson?.contentUrl && !lesson.contentUrl.startsWith("blob:")) {
      return lesson.contentUrl;
    }
    return DUMMY_LESSON_VIDEOS[index % DUMMY_LESSON_VIDEOS.length];
  };

  /* -------------------- VIDEO HELPERS -------------------- */
  const extractYoutubeId = (url: string): string | null => {
    if (url.includes("youtu.be")) {
      return url.split("youtu.be/")[1]?.split("?")[0] || null;
    } else if (url.includes("/shorts/")) {
      return url.split("/shorts/")[1]?.split("?")[0] || null;
    } else if (url.includes("v=")) {
      return url.split("v=")[1]?.split("&")[0] || null;
    }
    return null;
  };

  const extractVimeoId = (url: string): string | null => {
    return url.split("vimeo.com/")[1]?.split("?")[0] || null;
  };

  const getVideoEmbedUrl = (url: string): string | null => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = extractYoutubeId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (url.includes("vimeo.com")) {
      const videoId = extractVimeoId(url);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    return null;
  };

  const isExternalVideo = (url: string): boolean => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    );
  };

  const videoEmbedUrl = isExternalVideo(videoSrc)
    ? getVideoEmbedUrl(videoSrc)
    : null;

  const isExternalNonEmbeddable = (url: string) =>
    /^https?:\/\//i.test(url) &&
    !url.includes("blob.core.windows.net") &&
    !url.includes("youtube.com") &&
    !url.includes("youtu.be") &&
    !url.includes("vimeo.com") &&
    !url.endsWith(".mp4");

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth={type === "blog" ? "md" : "sm"}
      title={
        <Chip
          icon={style.icon}
          label={type.charAt(0).toUpperCase() + type.slice(1)}
          sx={{
            height: "25px",
            borderRadius: "10px",
            px: "10px",
            py: "2px",
            gap: "12px",
            bgcolor: style.bg,
            color: style.color,
            fontWeight: 500,
            opacity: 1,

            "& .MuiChip-icon": {
              color: style.color,
              marginLeft: 0,
            },

            "& .MuiChip-label": {
              padding: 0,
              fontSize: "14px",
              lineHeight: "20px",
            },
          }}
        />
      }
    >
      {/* BODY */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          {content.title}
        </Typography>

        {type !== "elearning" && (
          <Box
            sx={{
              overflow: "hidden",
              mb: 1,
            }}
          >
            {/* VIDEO */}
            {type === "video" && (
              <>
                {videoEmbedUrl ? (
                  <Box
                    component="iframe"
                    src={videoEmbedUrl}
                    width="100%"
                    height={260}
                    sx={{
                      border: "none",
                      borderRadius: "12px",
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isExternalNonEmbeddable(videoSrc) ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <CommonButton
                      variant="outlined"
                      onClick={() => window.open(videoSrc, "_blank")}
                    >
                      Click to Preview
                    </CommonButton>
                  </Box>
                ) : (
                  <video width="100%" height={260} controls>
                    <source src={videoSrc} type="video/mp4" />
                  </video>
                )}
              </>
            )}

            {/* BEFORE & AFTER IMAGE */}
            {type === "image" && media.before && media.after && (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                    mb:2,
                  }}
                >
                  {/* BEFORE */}
                  <Box sx={{ position: "relative" }}>
                    <Chip
                      label="Before"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        bgcolor: "#EDE9FE",
                        color: "#6D28D9",
                        fontWeight: 600,
                        zIndex: 10,
                      }}
                    />
                    <CommonImage
                      src={beforeImageSrc}
                      alt="Before"
                      sx={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                      }}
                    />
                  </Box>

                  {/* AFTER */}
                  <Box sx={{ position: "relative" }}>
                    <Chip
                      label="After"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        bgcolor: "#E0F2FE",
                        color: "#0369A1",
                        fontWeight: 600,
                        zIndex: 10,
                      }}
                    />
                    <CommonImage
                      src={afterImageSrc}
                      alt="After"
                      sx={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Box>
              </>
            )}

            {/* IMAGE CONTENT */}
            {type === "image" && !media.before && (
              <CommonImage
                src={imageSrc}
                alt="Image"
                sx={{
                  width: "100%",
                  height: 260,
                  objectFit: "cover",
                  borderRadius: "12px",
                  mb:2
                }}
              />
            )}

            {/* BLOG THUMBNAIL */}
            {type === "blog" && (
              <Box>
                <CommonImage
                  src={blogThumbnailSrc}
                  alt="Blog Thumbnail"
                  sx={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />

                <Typography
                  variant="subtitle2"
                  color="text.primary"
                  sx={{ mt: 2, mb: 1 }}
                >
                  {content.blogHeader}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* STATUS + DATE */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2  }}>
          <Chip
            label={
              content.status === "published"
                ? "Published"
                : content.status === "draft"
                  ? "Draft"
                  : content.status
            }
            sx={{
              height: 22,
              borderRadius: "8px",
              px: 1.6,
              backgroundColor:
                content.status === "published"
                  ? "#00A63E"
                  : content.status === "draft"
                    ? "primary.main"
                    : "error.main",
              color: "background.paper",

              "& .MuiChip-label": {
                padding: 0,
                fontSize: "0.70rem",
                fontWeight: 600,
                lineHeight: 1.2,
                textTransform: "capitalize",
              },
            }}
          />

          <Typography variant="caption" color="text.secondary">
            {/* {dayjs(content.updatedAt || content.createdAt).format("YYYY-MM-DD")} */}
            {dayjs(content.updatedAt || content.createdAt).format(DATE_FORMATS.DATE)}
          </Typography>
        </Box>

        <Box
          sx={{
            fontSize: 14,
            color: "text.secondary",

            "& p": {
              mb: 1,
            },

            /* restore list styles */
            "& ul": {
              listStyleType: "disc",
              paddingLeft: "20px",
              marginBottom: "8px",
            },
            "& ol": {
              listStyleType: "decimal",
              paddingLeft: "20px",
              marginBottom: "8px",
            },
            "& li": {
              marginBottom: "4px",
            },

            "& strong": {
              fontWeight: 600,
            },
          }}
          dangerouslySetInnerHTML={{
            __html: content.content || "",
          }}
        />
      </Box>

      {type === "elearning" && eLearningLessons.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {eLearningLessons.map((lesson: any, index: number) => {
            const isActive = activeLesson === index;
            return (
              <Accordion
                key={index}
                expanded={isActive}
                onChange={() => setActiveLesson(isActive ? null : index)}
                sx={{
                  mb: 1,
                  borderRadius: "8px",
                  "&:before": { display: "none" },
                }}
              >
                {/* -------- SUMMARY -------- */}
                <AccordionSummary
                  expandIcon={
                    <CommonIcon
                      name="ChevronDown"
                      size={20}
                      color={theme.palette.primary.main}
                    />
                  }
                  sx={{
                    cursor: "pointer",
                    backgroundColor: isActive
                      ? `${theme.palette.divider}`
                      : "transparent",
                    borderLeft: isActive
                      ? `3px solid ${theme.palette.primary.main}`
                      : "4px solid transparent",
                    height: isActive ? 60 : "auto",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {/* CHECK ICON */}
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: isActive
                          ? "none"
                          : `2px solid ${theme.palette.primary.main}`,
                        backgroundColor: isActive
                          ? "primary.main"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isActive && (
                        <CommonIcon name="Check" size={14} color="white" />
                      )}
                    </Box>

                    {/* TEXT */}
                    <Box>
                      <Typography variant="body1" color="primary.main">
                        Lesson {index + 1}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500 }}
                        color="primary.main"
                      >
                        {lesson.headertitle}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>

                {/* -------- DETAILS -------- */}
                <AccordionDetails
                  sx={{
                    //  px: 4, pb: 2 ,
                    backgroundColor: "background.paper",
                  }}
                >
                  {/* Lesson Title */}
                  <Typography variant="body1" mb={1}>
                    {lesson.title}
                  </Typography>

                  {/* Lesson Content */}
                  <Box
                    sx={{
                      fontWeight: theme.typography.caption,
                      "& p": { mb: 1 },
                      "& ul": { listStyleType: "disc", pl: 2 },
                      "& ol": { listStyleType: "decimal", pl: 2 },
                    }}
                    dangerouslySetInnerHTML={{
                      __html: lesson.lessoncontent || "",
                    }}
                  />

                  {/* Lesson Video */}
                  {lesson.contentUrl && (
                    <Box mt={1}>
                      {(() => {
                        const lessonVideoSrc = getLessonVideoSrc(lesson, index);
                        const lessonEmbedUrl = isExternalVideo(lessonVideoSrc)
                          ? getVideoEmbedUrl(lessonVideoSrc)
                          : null;

                        return lessonEmbedUrl ? (
                          <Box
                            component="iframe"
                            src={lessonEmbedUrl}
                            width="100%"
                            height={260}
                            sx={{
                              border: "none",
                              borderRadius: "8px",
                              mt: 1,
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <Box
                            component="video"
                            src={lessonVideoSrc}
                            controls
                            sx={{
                              width: "100%",
                              borderRadius: "8px",
                              mt: 1,
                            }}
                          />
                        );
                      })()}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <CommonButton
          variant="outlined"
          startIcon={
            <CommonIcon name="Pencil" color={theme.palette.text.primary} />
          }
          color="inherit"
          sx={{ borderColor: "rgba(0, 0, 0, 0.1)" }}
          onClick={() => {
            onEdit(content.id);
          }}
        >
          Edit
        </CommonButton>

        <CommonButton
          variant="outlined"
          startIcon={
            <CommonIcon name="Trash2" color={theme.palette.error.main} />
          }
          color="error"
          onClick={() => {
            onDelete(content.id);
          }}
        >
          Delete
        </CommonButton>
      </Box>
    </Modal>
  );
};

export default ContentViewModal;
