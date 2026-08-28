import { Box, useTheme, useMediaQuery } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

export default function MultiBarChart({
  title,
  subtitle,
  chart,
  titleColor,
  subtitleColor,
  loading = false,
}: Props) {
  const theme = useTheme();
  const { data, labels, colors } = chart;

  // // First key becomes X-axis (type, age, month... anything)
  // const xKey = Object.keys(data[0])[0];

  // // Remaining keys become bars
  // const barKeys = Object.keys(data[0]).slice(1);

  // const isEmpty = Array.isArray(chart?.data) && chart.data.length === 0;

  const safeData = Array.isArray(chart?.data) ? chart.data : [];

  const firstRow = safeData?.[0] ?? {};
  const xKey = Object.keys(firstRow)[0];
  const barKeys = Object.keys(firstRow).slice(1);
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

      <Box sx={{ width: "100%", height: { xs: 220, sm: 320 } }}>
        {loading ? (
          <Box sx={{ ml: 5 }}>
            <CommonSkeleton
              type="chart"
              height={320}
              barCount={barKeys.length || 1}
              categoryCount={safeData.length || 7}
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
            <BarChart
              data={safeData}
              barGap={6}
              margin={{
                top: 0,
                right: 0,
                bottom: 0,
                left: isMobile ? -18 : 0,
              }}
            >
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" />

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
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />

              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value: string) => (
                  <span
                    style={{
                      color: colors[value],
                      fontSize: 16,
                      fontWeight: 400,
                    }}
                  >
                    {labels[value] || value}
                  </span>
                )}
              />

              {barKeys.map((key) => (
                <Bar
                  key={key}
                  name={labels[key]}
                  dataKey={key}
                  fill={colors[key]}
                  barSize={45}
                  radius={[8, 8, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}
