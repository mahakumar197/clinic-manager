import {
  CommonButton,
  CommonCards,
  CommonIcon,
  CommonIconButton,
  CommonImage,
  CommonPageHeader,
  EmptyStateLoader,
} from "@/components/common";
import CommonPagination from "@/components/common/CommonPagination";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import PageContainer from "@/components/layouts/PageContainer";
import { contentService } from "@/services/modules/content.service";
import { toast } from "@/utils/toast";
import {
  Box,
  Chip,
  Grid,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ContentDeleteModal from "./ContentUploadModals/ContentDeleteModal";
import ContentViewModal from "./ContentUploadModals/ViewContentModal";
import CreateContentModal from "./CreateContentModal/CreateContentModal";
import { useContent } from "./hooks/useContent";
import { DATE_FORMATS } from "@/constants";

//  conditional MUI Tooltip 
const TruncatedDescription = ({ text }: { text?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkTruncation = useCallback(() => {
    const el = ref.current;
    if (el) setIsTruncated(el.scrollHeight > el.clientHeight);
  }, []);

  useEffect(() => {
    checkTruncation();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(checkTruncation);
    ro.observe(el);
    return () => ro.disconnect();
  }, [checkTruncation, text]);

  return (
    <Tooltip
      title={isTruncated ? text : ""}
      disableHoverListener={!isTruncated}
      disableTouchListener={!isTruncated}
      disableFocusListener={!isTruncated}
      enterTouchDelay={300}
      leaveTouchDelay={3000}
      arrow
    >
      <Typography
        ref={ref}
        variant="body2"
        sx={{
          mt: 0.3,
          color: "text.secondary",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          cursor: isTruncated ? "pointer" : "default",
        }}
      >
        {text}
      </Typography>
    </Tooltip>
  );
};

const categories = [
  { label: "All Types" },
  { label: "Videos", icon: <CommonIcon name="Video" /> },
  { label: "Images", icon: <CommonIcon name="Image" /> },
  { label: "Blogs", icon: <CommonIcon name="FileText" /> },
  { label: "E-Learning", icon: <CommonIcon name="GraduationCap" /> },
];

const ContentLibrary = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "#00A63E";
      case "Draft":
        return "primary.main";
      default:
        return "error.main";
    }
  };

  const { procedureId } = useParams<{ procedureId: string }>();

  const {
    contents,
    counts,
    pagination,
    loading,
    updateFilters,
    changePage,
    changeLimit,
    refresh,
  } = useContent({
    procedureId,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePreview, setDeletePreview] = useState<{
    title: string;
    type: string;
    status: "Published" | "Draft";
  } | null>(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [openViewModal, setOpenViewModal] = useState(false);

  const [viewType, setViewType] = useState<
    "blog" | "video" | "image" | "elearning" | null
  >(null);

  const [active, setActive] = useState("All Types");

  const TYPE_LABEL_MAP: Record<string, string> = {
    image: "Image",
    video: "Video",
    blog: "Blog",
    elearning: "E-learning",
  };

  const TYPE_ICON_MAP: Record<string, JSX.Element> = {
    image: <CommonIcon name="Image" />,
    video: <CommonIcon name="Video" />,
    blog: <CommonIcon name="FileText" />,
    elearning: <CommonIcon name="GraduationCap" />,
  };

  const procedure = contents[0]?.procedure;
  const headerTitle = procedure?.title ?? "Content Library";
  const headerSubtitle =
    procedure?.description ?? "Manage procedure related content";
  const headerBatch = procedure?.type
    ? procedure.type.charAt(0).toUpperCase() + procedure.type.slice(1)
    : undefined;

  const CATEGORY_TYPE_MAP: Record<string, string | undefined> = {
    "All Types": undefined,
    Videos: "video",
    Images: "image",
    Blogs: "blog",
    "E-Learning": "elearning",
  };

  type ContentStatus = "Published" | "Draft";

  // ------------------------------
  // FILTER CONTENTS
  // ------------------------------

  const handleCategoryClick = (label: string) => {
    setActive(label);

    updateFilters({
      type: CATEGORY_TYPE_MAP[label],
    });
  };

  //  API response to UI format
  const libraryCards = contents.map((content) => ({
    id: content.id,
    tag: TYPE_LABEL_MAP[content.type] ?? content.type,
    icon: TYPE_ICON_MAP[content.type],
    title: content.title,
    desc: content.description,
    image: content.thumbnail || content.thumbnailUrl,
    status: (content.status === "draft"
      ? "Draft"
      : "Published") as ContentStatus,
    date: content.updatedAt || content.createdAt,
  }));

  const [editingContentId, setEditingContentId] = useState<string | null>(null);

  const [viewId, setViewId] = useState<string | null>(null);

  const safeBatch = headerBatch?.toLowerCase() ?? "this procedure";

  const isEmpty = !loading && libraryCards.length === 0;

  const getBgColor = (tag) => {
    switch (tag) {
      case "Video":
        return "#DBEAFE";
      case "Image":
        return "#F3E8FF";
      case "Blog":
        return "#DCFCE7";
      case "E-learning":
        return "#FEF3C6";
      default:
        return "error.main";
    }
  };

  const getTextColor = (tag) => {
    switch (tag) {
      case "Video":
        return "info.dark";
      case "Image":
        return "secondary.main";
      case "Blog":
        return "success.main";
      case "E-learning":
        return "warning.main";
      default:
        return "error.main";
    }
  };

  const cards = [
    {
      id: 1,
      title: "Total Content",
      value: counts.total,
      iconName: "Layers",
      variant: "white",
    },
    {
      id: 2,
      title: "Videos",
      value: counts.video,
      iconName: "Video",
      variant: "blue",
    },
    {
      id: 3,
      title: "Images",
      value: counts.image,
      iconName: "Image",
      variant: "red",
    },
    {
      id: 4,
      title: "Blogs",
      value: counts.blog,
      iconName: "FileText",
      variant: "green",
    },
    {
      id: 5,
      title: "E-Learning",
      value: counts.elearning,
      iconName: "GraduationCap",
      variant: "orange",
    },
  ];

  const handleViewEdit = (id: string) => {
    setOpenViewModal(false);
    setViewId(null);

    setMode("edit");
    setEditingContentId(id);
    setOpenCreateModal(true);
  };

  const handleViewDelete = (id: string) => {
    const card = libraryCards.find((c) => c.id === id);
    if (!card) return;

    setOpenViewModal(false);
    setViewId(null);

    setDeleteId(id);
    setDeletePreview({
      title: card.title,
      type: card.tag,
      status: card.status,
    });
    setOpenDeleteModal(true);
  };

  const handleDeleteContent = async () => {
    if (!deleteId) return;
    try {
      await contentService.deleteContent(deleteId);
      toast.success("Content deleted successfully");
      setOpenDeleteModal(false);
      setDeleteId(null);
      setDeletePreview(null);
      refresh();
    } catch (err) {
      console.error("Failed to delete content", err);
      toast.error("Failed to delete content");
    }
  };

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCard, setMenuCard] = useState<any>(null);

  const isMenuOpen = Boolean(menuAnchorEl);

  const openMenu = (e: React.MouseEvent<HTMLElement>, card: any) => {
    setMenuAnchorEl(e.currentTarget);
    setMenuCard(card);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuCard(null);
  };

  return (
    <PageContainer>
      {/* Header */}
      <Grid
        container
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        gap={isMobile ? 2 : 0}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CommonPageHeader
            title={headerTitle}
            subtitle={headerSubtitle}
            enableBack
            batch={headerBatch}
            chipStyle={{ backgroundColor: "#F1F5F9" }}
          />
        </Box>

        <Box sx={{ width: isMobile ? "100%" : "auto" }}>
          <CommonButton
            variant="contained"
            startIcon={<CommonIcon name="Plus" />}
            fullWidth={isMobile}
            onClick={() => {
              setOpenCreateModal(true);
              setMode("create");
            }}
          >
            Add Content
          </CommonButton>
        </Box>
      </Grid>

      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <CommonCards {...c} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* HEADER + FILTERS ROW */}
      <Grid
        container
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid>
          <Typography variant="h6">Content Library</Typography>
        </Grid>

        {/* CATEGORY BUTTONS */}

        <Grid>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              justifyContent: isMobile ? "flex-start" : "flex-start",
            }}
          >
            {categories.map((cat) => (
              <CommonButton
                key={cat.label}
                variant="outlined"
                onClick={() => handleCategoryClick(cat.label)}
                sx={{
                  px: 1,
                  py: 0.6,
                  borderRadius: "8px",
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: 500,
                  textTransform: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border: "1px solid",
                  borderColor:
                    active === cat.label ? "primary.main" : "text.disabled",
                  backgroundColor:
                    active === cat.label ? "primary.main" : "transparent",
                  color:
                    active === cat.label
                      ? "background.paper"
                      : theme.palette.text.primary,
                  transition: "all 0.1s ease-in-out",
                }}
              >
                {cat.icon && (
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {cat.icon}
                  </Box>
                )}

                {cat.label}
              </CommonButton>
            ))}
          </Box>
        </Grid>
      </Grid>

      {isEmpty && (
        <EmptyStateLoader
          title={`No ${active.toLowerCase()} content found for ${safeBatch}`}
          subtitle={
            active === "All Types"
              ? `No content available under ${safeBatch}`
              : `Click + Add Content to create one`
          }
          height={220}
          icon="FileX"
        />
      )}

      {/* CONTENT CARDS GRID */}
      <Grid container spacing={isMobile ? 1.5 : 3}>
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
            <Grid
              key={index}
              size={{ sm: 12, md: 6, lg: 4, xl: 4 }}
              sx={{ width: "100%" }}
            >
              <CommonSkeleton type="contentImageLibrary" />
            </Grid>
          ))
          : libraryCards.map((card, index) => (
            <Grid
              key={index}
              size={{ sm: 12, md: 6, lg: 4, xl: 4 }}
              sx={{ width: "100%" }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "320px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: "primary.contrastText",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* IMAGE + TAG + STATUS */}
                <Box
                  sx={{
                    position: "relative",
                    height: "200px",
                    overflow: "hidden",
                  }}
                >
                  <CommonImage
                    src={card.image}
                    alt={card.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <Chip
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {card.icon}
                        </Box>
                        <Box
                          component="span"
                          sx={{
                            fontSize: theme.typography.caption.fontSize,
                            fontWeight: 500,
                          }}
                        >
                          {card.tag}
                        </Box>
                      </Box>
                    }
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      height: 22,
                      borderRadius: "8px",
                      backgroundColor: getBgColor(card.tag),
                      color: getTextColor(card.tag),
                      px: 1,
                      "& .MuiChip-label": {
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        lineHeight: 1.2,
                      },
                    }}
                  />

                  {card.status && (
                    <Chip
                      label={card.status}
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        height: 22,
                        borderRadius: "8px",
                        px: 1.6,
                        backgroundColor: getStatusColor(card.status),
                        color: "background.paper",
                        "& .MuiChip-label": {
                          padding: 0,
                          fontSize: "0.70rem",
                          lineHeight: 1.2,
                        },
                      }}
                    />
                  )}
                </Box>

                {/* CARD CONTENT */}
                <Box
                  sx={{
                    p: 2,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body1">{card.title}</Typography>

                    <CommonIconButton
                      icon={<CommonIcon name="MoreVertical" />}
                      onClick={(e) => openMenu(e, card)}
                    />
                  </Box>
                  <TruncatedDescription text={card.desc} />

                  <Box
                    sx={{
                      mt: "auto",
                      pt: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {card.date && (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {/* {dayjs(card.date).format("YYYY-MM-DD")} */}
                        {dayjs(card.date).format(DATE_FORMATS.DATE)}
                      </Typography>
                    )}

                      <Menu
                        anchorEl={menuAnchorEl}
                        open={isMenuOpen}
                        onClose={closeMenu}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        PaperProps={{
                          elevation: 0,
                          sx: {
                            borderRadius: "14px",
                            minWidth: 100,
                            boxShadow: "none",
                            border: "1px solid",
                            borderColor: "divider",
                          },
                        }}
                      >
                        {/* VIEW */}
                        <MenuItem
                          onClick={() => {
                            setViewId(menuCard.id);
                            setViewType(menuCard.tag.toLowerCase());
                            setOpenViewModal(true);
                            closeMenu();
                          }}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Typography variant="button">View</Typography>
                          <CommonIcon name="Eye" size={20} />
                        </MenuItem>

                        {/* EDIT*/}
                        <MenuItem
                          onClick={() => {
                            setMode("edit");
                            setEditingContentId(menuCard.id);
                            setOpenCreateModal(true);
                            closeMenu();
                          }}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Typography variant="button">Edit</Typography>
                          <CommonIcon name="Pencil" size={20} />
                        </MenuItem>

                        {/* DELETE */}
                        <MenuItem
                          onClick={() => {
                            setDeleteId(menuCard.id);
                            setDeletePreview({
                              title: menuCard.title,
                              type: menuCard.tag,
                              status: menuCard.status,
                            });
                            setOpenDeleteModal(true);
                            closeMenu();
                          }}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                            color: "error.main",
                          }}
                        >
                          <Typography variant="button" color="error.main">
                            Delete
                          </Typography>
                          <CommonIcon
                            name="Trash2"
                            size={20}
                            color={theme.palette.error.main}
                          />
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
      </Grid>

      <CommonPagination
        pageMeta={pagination}
        onPageChange={changePage}
        onRowsPerPageChange={changeLimit}
      />

      <CreateContentModal
        key={`${openCreateModal}-${mode}-${editingContentId ?? "new"}`}
        open={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false);
          setEditingContentId(null); 
          setMode("create"); 
        }}
        procedureId={procedureId!}
        procedureTitle={headerTitle}
        mode={mode}
        contentId={editingContentId}
        onSuccess={refresh}
      />

      <ContentDeleteModal
        open={openDeleteModal}
        preview={deletePreview}
        onClose={() => {
          setOpenDeleteModal(false);
          setDeleteId(null);
          setDeletePreview(null);
        }}
        onDelete={handleDeleteContent}
      />

      <ContentViewModal
        open={openViewModal}
        contentId={viewId}
        contentType={viewType}
        onClose={() => {
          setOpenViewModal(false);
          setViewId(null);
        }}
        onEdit={handleViewEdit}
        onDelete={handleViewDelete}
      />
    </PageContainer>
  );
};

export default ContentLibrary;
