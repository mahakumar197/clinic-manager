import { Box, Typography, useTheme } from "@mui/material";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import CommonPageHeader from "./CommonPageHeader";
import { EmptyStateLoader } from ".";
// import CommonSkeleton from "./CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";

interface PieItem {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // required for recharts
}

interface TooltipEntry {
  payload: PieItem;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
}

const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  const { name, value, color: dotColor } = payload[0].payload as PieItem;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 1,
        bgcolor: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: dotColor,
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" color="text.primary">
        {name} : {value}
      </Typography>
    </Box>
  );
};

interface Props {
  title: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  data: PieItem[];
  loading?: boolean;
}

export default function CommonPieChart({
  title,
  subtitle,
  data,
  titleColor,
  subtitleColor,
  loading = false,
}: Props) {
  const theme = useTheme();
  // const isEmpty = Array.isArray(data) && data.length === 0;
  const safeData = Array.isArray(data) ? data : [];
  const isEmpty = safeData.length === 0;

  return (
    <Box
      sx={{
        background: "#fff",
        borderRadius: "16px",
        padding: { xs: 2, sm: 3 },
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

      {/* Pie Chart */}
      <Box sx={{ width: "100%", height: "352px" }}>
        {loading ? (
          <CommonSkeleton type="pieChart" height={280} />
        ) : isEmpty ? (
          // {/* {isEmpty ? ( */}
          <EmptyStateLoader title={title} />
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={safeData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                nameKey="name"
              // label={({ name, value }) => `${name} ${value}%`}
              // labelLine={{ stroke: "#ccc" }}
              >
                {safeData.map((item, i) => (
                  <Cell key={i} fill={item.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              {/* <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
              /> */}
              {/* <Tooltip formatter={(value) => `${value}%`} /> */}
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}
