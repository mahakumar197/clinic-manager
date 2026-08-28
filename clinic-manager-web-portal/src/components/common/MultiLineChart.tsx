import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CommonPageHeader from "./CommonPageHeader";
import { EmptyStateLoader } from ".";
// import CommonSkeleton from "./CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";

interface ChartStructure {
  data: any[];
  labels: { [key: string]: string };
  colors: { [key: string]: string };
}

interface Props {
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  chart: ChartStructure;
  loading?: boolean;
}

export default function MultiLineChart({
  title,
  subtitle,
  chart,
  titleColor,
  subtitleColor,
  loading = false,
}: Props) {
  const theme = useTheme();
  const { data, labels, colors } = chart;

  // // First key = X-axis
  // const xKey = Object.keys(data[0])[0];

  // // Remaining keys = line keys
  // const lineKeys = Object.keys(data[0]).slice(1);

  // const firstRow = data?.[0] ?? {};
  // const xKey = Object.keys(firstRow)[0];
  // const lineKeys = Object.keys(firstRow).slice(1);

  // EMPTY only when data is []
  // const isEmpty = Array.isArray(chart?.data) && chart.data.length === 0;

  const safeData = Array.isArray(chart?.data) ? chart.data : [];

  const firstRow = safeData[0] ?? {};
  const xKey = Object.keys(firstRow)[0];
  const lineKeys = Object.keys(firstRow).slice(1);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEmpty = safeData.length === 0;

  return (
    <Box
      sx={{
        background: "#fff",
        borderRadius: "16px",
        padding: "24px",
        border: `1px solid ${theme.palette.divider}`,
        width: "100%",
        "& *:focus": {
          outline: "none",
        },
        "& *:focus-visible": {
          outline: "none",
        },
      }}
    >
      <Box
        sx={{
          mb: 5,
        }}
      >
        {loading ? (
          <Box>
            {/* Title skeleton  */}
            <CommonSkeleton type="text" width={240} height={28} />

            {/* Subtitle skeleton – only if subtitle exists */}
            {subtitle && <CommonSkeleton type="text" width={220} height={18} />}
          </Box>
        ) : (
          <CommonPageHeader
            title={title}
            subtitle={subtitle}
            titleColor={titleColor}
            subtitleColor={subtitleColor}
          />
        )}
      </Box>

      <Box sx={{ width: "100%", height: { xs: 200, sm: 280 } }}>
        {loading ? (
          <Box sx={{ ml: 5, mt: 10 }}>
            <CommonSkeleton
              type="lineChart"
              height={280}
              lineCount={lineKeys.length || 1}
            />
          </Box>
        ) : isEmpty ? (
          // {isEmpty ? (
          <Box
            sx={{
              ml: 10,
            }}
          >
            <EmptyStateLoader title={title} />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                bottom: 0,
                left: isMobile ? -18 : 0,
              }}
            >
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />

              <XAxis
                dataKey={xKey}
                tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 400 }}
                axisLine={{ stroke: "#D1D5DB" }}
                tickLine={true}
              />

              <YAxis
                tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 400 }}
                axisLine={{ stroke: "#D1D5DB" }}
                tickLine={true}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />

              {lineKeys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={labels[key]}
                  stroke={colors[key]}
                  strokeWidth={2}
                  dot={{
                    r: 5,
                    fill: "#fff",
                    stroke: colors[key],
                    strokeWidth: 2,
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* LEGEND */}
      {!loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}>
          {lineKeys.map((key) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  border: `3px solid ${colors[key]}`,
                }}
              />
              <Typography
                sx={{ color: colors[key], fontSize: 16, fontWeight: 400 }}
              >
                {labels[key]}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
