import { Box, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import CommonPageHeader from "./CommonPageHeader";
// import CommonSkeleton from "./CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";

const StyledLinear = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 8,
  backgroundColor: theme.palette.divider,
  [`& .${LinearProgress.name}-bar`]: {
    borderRadius: 8,
  },
}));

interface ProgressItem {
  label?: string;
  subLabel?: string;
  showDot?: boolean;
  value: number;
  count?: number;
  color?: string;
}

interface CommonProgressListProps {
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  data: ProgressItem[];
  columns?: 1 | 2; //  NEW (default behavior = 1)
  loading?: boolean;
}

export default function CommonProgressList({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  data,
  loading,
  columns = 1,
}: CommonProgressListProps) {
  const hasSubLabel = data?.some((item) => !!item.subLabel);

  return (
    <>
      <Box p={1}>
        {loading ? (
          <>
            <CommonSkeleton type="text" width={240} height={26} />
            {subtitle && <CommonSkeleton type="text" width={320} height={18} />}
          </>
        ) : (
          <CommonPageHeader
            title={title}
            subtitle={subtitle}
            titleColor={titleColor}
            subtitleColor={subtitleColor}
          />
        )}
      </Box>
      {/*  CONTENT LAYOUT */}
      <Box p={2}>
        {loading ? (
          <CommonSkeleton
            type="progress"
            columns={columns}
            rows={columns === 1 ? 3 : 2}
            showSubLabel={hasSubLabel}
          />
        ) : (
          <>
            {columns === 1 && (
              <Stack spacing={3}>
                {data.map((item, idx) => (
                  <ProgressItemView key={idx} item={item} columns={columns} />
                ))}
              </Stack>
            )}

            {/*(ONLY when columns=2) */}
            {columns === 2 && (
              <Grid container spacing={3}>
                {data.map((item, idx) => (
                  <Grid key={idx} size={{ xs: 12, md: 6 }}>
                    <ProgressItemView item={item} columns={columns} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>
    </>
  );
}

/*   Progress Item UI */
const ProgressItemView = ({
  item,
  columns,
}: {
  item: ProgressItem;
  columns?: 1 | 2; // used only to control progress height
}) => {
  return (
    <Box>
      {(item.label || item.count !== undefined) && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          {item.label ? (
            <Stack direction="row" spacing={1} alignItems="center">
              {item.showDot && (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: item.color ?? "primary.main",
                  }}
                />
              )}
              <Typography variant="body1">{item.label}</Typography>
            </Stack>
          ) : (
            <Box />
          )}

          <Typography variant="body1">
            {item.count ? `${item.count} forms • ` : ""}
            <Box
              component="span"
              sx={{
                color: item.color ?? "primary.main",
              }}
            >
              {item.value}%
            </Box>
          </Typography>
        </Stack>
      )}

      {/* Progress Bar */}
      <StyledLinear
        variant="determinate"
        value={item.value}
        sx={{
          height: columns === 2 ? 12 : 8,
          "& .MuiLinearProgress-bar": {
            backgroundColor: item.color,
          },
        }}
      />

      {/* Optional Sub Label */}

      {item.subLabel && (
        <Typography variant="body2" mt={0.6} color="text.secondary">
          {item.subLabel}
        </Typography>
      )}
    </Box>
  );
};
