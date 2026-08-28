import {
  BarChart,
  BaseSelect,
  CommonButton,
  CommonCards,
  CommonIcon,
  CommonPageHeader,
  LineChart,
  ProgressBar,
  DateRangeFilter,
} from "@/components/common";
import PageContainer from "@/components/layouts/PageContainer";
import { SelectOption } from "@/types/select";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useState, useMemo } from "react";
import { DateRangeValue } from "@/types/dateRange";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import {
  useUserReports,
  useUserReportsExport,
  useUserReportsPDFExport,
} from "../hooks";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { format } from "date-fns";

const AnalyticsView = () => {
  const theme = useTheme();

  // Export hook
  const { exportUserReports, isExporting } = useUserReportsExport();
  const { exportUserReportsPDF, isExporting: isPDFExporting } =
    useUserReportsPDFExport();

  // Date filter state
  const [dateRange, setDateRange] = useState<SelectOption | null>(null);
  const [customRange, setCustomRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });

  // Get date filter options from master dropdown
  const { options: dateFilterOptions } = useDropdown(
    DropdownType.DATE_FILTER_TYPE,
    false,
  );

  // Check if "Custom Range" is selected
  const isCustomRange =
    dateFilterOptions.find((opt) => opt.value === dateRange?.value)?.label ===
    "Custom Range";

  // Prepare date filter parameters
  const dateFilterParams = useMemo(() => {
    if (!dateRange) return undefined;

    // If custom range is selected and dates are provided
    if (isCustomRange && customRange.startDate && customRange.endDate) {
      return {
        startDate: format(customRange.startDate.toDate(), "yyyy-MM-dd"),
        endDate: format(customRange.endDate.toDate(), "yyyy-MM-dd"),
        filter: String(dateRange.value),
      };
    }

    // For predefined ranges, pass the filter value
    if (!isCustomRange && dateRange.value) {
      return {
        filter: String(dateRange.value),
      };
    }

    return undefined;
  }, [dateRange, isCustomRange, customRange]);

  // Fetch user reports data
  const { reportsData, loading } = useUserReports(dateFilterParams);

  return (
    <PageContainer>
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 12,
            md: 6,
            lg: isCustomRange ? 4 : 4,
            xl: isCustomRange ? 3 : 5,
          }}
        >
          <Box>
            <CommonPageHeader
              title="Personal Analytics Dashboard"
              subtitle="Your performance statistics and insights"
            />
          </Box>
        </Grid>
        <Grid
          container
          spacing={2}
          size={{
            xs: 12,
            sm: 12,
            md: 12,
            lg: isCustomRange ? 8 : 8,
            xl: isCustomRange ? 9 : 7,
          }}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "end",
          }}
        >
          {/* Date Range Select */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: isCustomRange ? 3 : 4,
              lg: isCustomRange ? 3 : 4,
              xl: isCustomRange ? 2 : 3,
            }}
          >
            <BaseSelect
              placeholder="Date Range"
              name="range"
              value={dateRange}
              onChange={(newValue: SelectOption | null) => {
                setDateRange(newValue);

                if (newValue?.label !== "Custom Range") {
                  setCustomRange({ startDate: null, endDate: null });
                }
              }}
              options={dateFilterOptions}
            />
          </Grid>
          {isCustomRange && (
            <Grid
              size={{ xs: 12, sm: 6, md: isCustomRange ? 3 : 4, lg: 3, xl: 3 }}
            >
              <DateRangeFilter
                placeholder
                value={customRange}
                onChange={setCustomRange}
              />
            </Grid>
          )}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: isCustomRange ? 3 : 4,
              lg: isCustomRange ? 3 : 4,
              xl: 2,
            }}
          >
            <CommonButton
              variant="outlined"
              startIcon={<CommonIcon name="Download" />}
              fullWidth
              isBaseHeight
              onClick={async () => {
                const filters: any = {};
                if (dateRange) {
                  if (
                    isCustomRange &&
                    customRange.startDate &&
                    customRange.endDate
                  ) {
                    filters.startDate = format(
                      customRange.startDate.toDate(),
                      "yyyy-MM-dd",
                    );
                    filters.endDate = format(
                      customRange.endDate.toDate(),
                      "yyyy-MM-dd",
                    );
                  } else if (!isCustomRange && dateRange.value) {
                    filters.filter = String(dateRange.value);
                  }
                }

                await exportUserReportsPDF(filters);
              }}
              loading={isPDFExporting}
              disabled={isPDFExporting}
            >
              {isPDFExporting ? "Preparing..." : "Export PDF"}
            </CommonButton>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: isCustomRange ? 3 : 4,
              lg: isCustomRange ? 3 : 4,
              xl: 2,
            }}
          >
            <CommonButton
              variant="outlined"
              startIcon={<CommonIcon name="Download" />}
              onClick={async () => {
                // Build date filter params
                const filters: any = {};

                if (dateRange) {
                  if (
                    isCustomRange &&
                    customRange.startDate &&
                    customRange.endDate
                  ) {
                    filters.startDate = format(
                      customRange.startDate.toDate(),
                      "yyyy-MM-dd",
                    );
                    filters.endDate = format(
                      customRange.endDate.toDate(),
                      "yyyy-MM-dd",
                    );
                  } else if (!isCustomRange && dateRange.value) {
                    filters.filter = String(dateRange.value);
                  }
                }

                await exportUserReports(filters);
              }}
              loading={isExporting}
              disabled={isExporting}
              fullWidth
            >
              {isExporting ? "Exporting..." : "Export Excel"}
            </CommonButton>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {reportsData?.cards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 6, lg: 3,xl:3 }}>
            <CommonCards {...c} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12,sm:12,md:12, lg: 6, xl: 6 }}>
          <BarChart
            title="Weekly Approvals"
            subtitle="Number of forms approved each day this week"
            titleColor="primary.main"
            subtitleColor="text.secondary"
            loading={loading}
            chart={
              reportsData?.weeklyApprovals || {
                data: [],
                labels: {},
                colors: {},
              }
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm:12,md:12,lg: 6, xl: 6 }}>
          <LineChart
            loading={loading}
            title="Response Time Trend"
            subtitle="Average response time in hours over the past month"
            titleColor="primary.main"
            subtitleColor="text.secondary"
            chart={
              reportsData?.responseTimeTrend || {
                data: [],
                labels: {},
                colors: {},
              }
            }
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 12, xl: 12 }}>
          <Box
            sx={{
              background: "background.paper",
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              padding: "24px",
              width: "100%",
            }}
          >
            <ProgressBar
              title="Form Types Breakdown"
              subtitle="Distribution of approved forms by type this month"
              titleColor="primary.main"
              subtitleColor="text.secondary"
              data={reportsData?.formTypes || []}
              loading={loading}
            />
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 12, xl: 12 }}>
          <Box
            sx={{
              background: `${theme.palette.primary.light}`,
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              padding: "24px",
              width: "100%",
            }}
          >
            <ProgressBar
              title="Performance Summary"
              subtitle="Overall completion and efficiency metrics"
              data={reportsData?.performanceSummary || []}
              loading={loading}
              titleColor="primary.main"
              subtitleColor="text.secondary"
              columns={2}
            />
            {loading ? (
              <CommonSkeleton type="statusCard" />
            ) : (
              reportsData?.performanceSummary?.[0]?.outstandingPerformance && (
                <Box
                  sx={{
                    mt: 1,
                    backgroundColor: "background.paper",
                    borderRadius: "10px",
                    border: `1px solid ${theme.palette.divider}`,
                    px: "17px",
                    py: "17px",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "success.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CommonIcon
                      name="CircleCheck"
                      size={20}
                      color={theme.palette.success.main}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body1">
                      Outstanding Performance
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      You're in the top 10% of staff for response time and
                      approval quality. Keep up the excellent work!
                    </Typography>
                  </Box>
                </Box>
              )
            )}
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
export default AnalyticsView;
