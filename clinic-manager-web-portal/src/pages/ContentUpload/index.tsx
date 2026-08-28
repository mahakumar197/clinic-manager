import {
  Box,
  Chip,
  Grid,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useState } from "react";

import {
  BaseTextField,
  CommonButton,
  CommonCards,
  CommonIcon,
  CommonImage,
  CommonPageHeader,
  EmptyStateLoader,
} from "@/components/common";
import CommonPagination from "@/components/common/CommonPagination";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import PageContainer from "@/components/layouts/PageContainer";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";
import { useProcedure } from "./hooks/useProcedure";

const categories = ["All", "Face", "Men", "Breast", "Body"];

interface Props {
  onSelect: (item: any) => void;
  selectedMessage: any;
}

const ContentUpload = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");


  const {
    procedures,
    statusCounts,
    pagination,
    loading,
    updateFilters,
    changePage,
    changeLimit,
  } = useProcedure();

  const isEmpty = !loading && procedures.length === 0;
  const emptyTitle = search
    ? `No results for "${search}"`
    : active !== "All"
      ? `No ${active} procedures found`
      : "No procedures available";

  const emptySubtitle = search
    ? "Try adjusting your search keywords"
    : "Please check back later or add new procedures";

  const formattedCardData = procedures.map((p) => ({
    tag: p.type,
    title: p.title,
    desc: p.description,
    items: p.contentCount,
    image: p.thumbnail,
    procedureId: p.id,
  }));

  const cards = [
    {
      id: 1,
      title: "Total Procedures",
      value: statusCounts.total,
      iconName: "CircleCheck",
      variant: "green",
    },
    {
      id: 2,
      title: "Published",
      value: statusCounts.published,
      iconName: "Globe",
      variant: "blue",
    },
    {
      id: 3,
      title: "Overdue",
      value: statusCounts.archived,
      iconName: "Clock",
      variant: "red",
    },
    {
      id: 4,
      title: "Drafts",
      value: statusCounts.draft,
      iconName: "FileText",
      variant: "white",
    },
  ];

  const handleViewProcedure = (procedureId: string) => {
    navigate(ROUTES.CONTENT_LIBRARY.replace(":procedureId", procedureId));
  };

  const handleCategoryClick = (cat: string) => {
    setActive(cat);

    if (cat === "All") {
      updateFilters({ type: undefined });
    } else {
      updateFilters({
        type: cat.toLowerCase(),
      });
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <Grid
        container
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Grid size={{ xs: 12, sm: 12, md: 8 }}>
          <Box>
            <CommonPageHeader
              title="Content Management"
              subtitle="Manage educational content for surgical procedures"
            />
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {cards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CommonCards {...c} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* SEARCH + FILTERS */}
      <Box
        sx={{
          p: isMobile ? 1.5 : 2,
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "primary.contrastText",
        }}
      >
        <Grid
          container
          spacing={1.5}
          direction={isMobile ? "column" : "row"}
          alignItems={isMobile ? "stretch" : "center"}
          justifyContent="space-between"
        >
          {/* Search */}

          <Grid>
            <Grid
              sx={{
                width: { xs: "100%", sm: "100%", md: "100%", lg: "666px" },
              }}
            >
              <BaseTextField
                placeholder="Search procedures..."
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  const cleanedValue = value.trimStart();
                  updateFilters({
                    // search: value || undefined,
                    search: cleanedValue || undefined,
                  });
                }}
              />
            </Grid>
          </Grid>

          {/* Categories */}
          <Grid>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {categories.map((cat) => (
                <CommonButton
                  key={cat}
                  variant={active === cat ? "contained" : "outlined"}
                  // onClick={() => setActive(cat)}
                  onClick={() => handleCategoryClick(cat)}
                  sx={{
                    borderRadius: "10px",
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: 500,
                    textTransform: "none",
                    backgroundColor:
                      active === cat ? "primary.main" : "transparent",
                    color:
                      active === cat
                        ? "primary.contrastText"
                        : "text.secondary",
                    borderColor:
                      active === cat
                        ? "primary.main"
                        : "secondary.contrastText",
                    "&:hover": {
                      backgroundColor:
                        active === cat ? "primary.dark" : "primary.light",
                    },
                  }}
                >
                  {cat}
                </CommonButton>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {isEmpty && (
        <EmptyStateLoader
          title={emptyTitle}
          subtitle={emptySubtitle}
          height={220}
          icon="FileX"
        />
      )}

      {/* CARD GRID */}
      <Grid container spacing={isMobile ? 1.5 : 3}>
        {loading
          ? Array.from({ length: pagination.limit }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <CommonSkeleton type="contentImage" />
              </Grid>
            ))
          : formattedCardData.map((card, index) => (
              <Grid key={index} size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 4 }}>
                <Box
                  sx={{
                    width: "100%",
                    height: "320px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "default",
                    backgroundColor: "primary.contrastText",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* IMAGE SECTION */}
                  <Box
                    sx={{
                      position: "relative",
                      height: "240px",
                      overflow: "hidden",
                    }}
                  >
                    <CommonImage
                      src={card.image}
                      alt="Procedure Image"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {/* TAG CHIP */}
                    <Chip
                      label={
                        card.tag
                          ? card.tag.charAt(0).toUpperCase() + card.tag.slice(1)
                          : ""
                      }
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        height: 22,
                        borderRadius: "8px",
                        backgroundColor: "background.paper",
                        color: "text.primary",
                        fontSize: theme.typography.caption.fontSize,
                        fontWeight: theme.typography.overline.fontWeight,
                        px: 1,
                        textTransform: "none",
                        "& .MuiChip-label": {
                          padding: 0,
                          textTransform: "none",
                          lineHeight: 1.2,
                        },
                      }}
                    />

                    {/* GRADIENT */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background: card?.image
                          ? "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)"
                          : "none",
                      }}
                    />

                    {/* TEXT INSIDE IMAGE */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 20,
                        left: 16,
                        right: 16,
                        zIndex: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ color: "background.paper", mb: 0.3 }}
                      >
                        {card.title}
                      </Typography>

                      <Typography variant="caption" sx={{ color: "divider" }}>
                        {card.desc}
                      </Typography>
                    </Box>
                  </Box>

                  {/* FOOTER */}
                  <Box
                    sx={{
                      height: "80px",
                      backgroundColor: "primary.contrastText",
                      padding: { xs: "14px 16px", md: "18px 20px" },
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* LEFT */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.2 }}
                    >
                      <Box sx={{ opacity: 0.6, display: "flex" }}>
                        <CommonIcon name="BookOpen" size={isMobile ? 14 : 16} />
                      </Box>
                      <Typography variant="body2">
                        {card.items} items
                      </Typography>
                    </Box>

                    {/* RIGHT */}
                    <Box>
                      <Link
                        onClick={() => handleViewProcedure(card.procedureId)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          color: "primary.main",
                          textDecoration: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          View Content{" "}
                        </Typography>
                        <CommonIcon name="MoveRight" />
                      </Link>
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
    </PageContainer>
  );
};

export default ContentUpload;
