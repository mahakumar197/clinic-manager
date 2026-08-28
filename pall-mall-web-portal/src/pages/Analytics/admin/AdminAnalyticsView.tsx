import {
  BarChart,
  BaseSelect,
  CommonButton,
  DateRangeFilter,
  LineChart,
  PieChart,
  CommonCards,
  CommonIcon,
  CommonPageHeader,
} from "@/components/common";

import PageContainer from "@/components/layouts/PageContainer";
import { SelectOption } from "@/types/select";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useState, useMemo } from "react";
import { PERFORMANCE_USER_COLUMNS } from "./AdminDummyData";
import { DateRangeValue } from "@/types/dateRange";
import { CommonTable } from "@/components/common";
import {
  useReportsDashboard,
  usePerformanceByUser,
  useAdminReportsExport,
  useAdminReportsPDFExport,
} from "../hooks";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { format } from "date-fns";

const AdminAnalyticsView = () => {
  const theme = useTheme();

  // Export hooks
  const { exportAdminReports, isExporting } = useAdminReportsExport();
  const { exportAdminReportsPDF, isExporting: isPDFExporting } =
    useAdminReportsPDFExport();

  // Date filter state
  const [dateRange, setDateRange] = useState<SelectOption | null>(null);
  const [customRange, setCustomRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });

  // Get date filter options from master dropdown
  const { options: dateFilterOptions } = useDropdown(
    DropdownType.DATE_FILTER_TYPE,
    false
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

  // Custom hooks for data fetching with date filters
  const { dashboardData, loading: dashboardLoading } =
    useReportsDashboard(dateFilterParams);
  const {
    users: performanceUsers,
    pagination,
    loading: performanceLoading,
    isFetching: performanceFetching,
    changePage,
    changeLimit,
  } = usePerformanceByUser(dateFilterParams);

  return (
    <PageContainer>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
          <Box>
            <CommonPageHeader
              title="Reporting & Analytics"
              subtitle="Track performance metrics and insights"
            />
          </Box>
        </Grid>
        <Grid
          container
          spacing={2}
          size={{ xs: 12, sm: 12, md: 12, lg: 8 }}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "end",
          }}
        >
          {/* Date Range Select */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 2.5 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <DateRangeFilter
                disableFuture
                placeholder
                value={customRange}
                onChange={setCustomRange}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 2.5 }}>
            <CommonButton
              variant="outlined"
              startIcon={<CommonIcon name="Download" />}
              fullWidth
              isBaseHeight
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
                      "yyyy-MM-dd"
                    );
                    filters.endDate = format(
                      customRange.endDate.toDate(),
                      "yyyy-MM-dd"
                    );
                  } else if (!isCustomRange && dateRange.value) {
                    filters.filter = String(dateRange.value);
                  }
                }

                await exportAdminReportsPDF(filters);
              }}
              loading={isPDFExporting}
              disabled={isPDFExporting}
            >
              {isPDFExporting ? "Preparing PDF..." : "Export PDF"}
            </CommonButton>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4, xl: 2.5 }}>
            {/* <CommonButton
              variant="outlined"
              startIcon={<CommonIcon name="Download" />}
              fullWidth
              isBaseHeight
            >
              Export CSV
            </CommonButton> */}

            <CommonButton
              variant="outlined"
              startIcon={<CommonIcon name="Download" />}
              isBaseHeight
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
                      "yyyy-MM-dd"
                    );
                    filters.endDate = format(
                      customRange.endDate.toDate(),
                      "yyyy-MM-dd"
                    );
                  } else if (!isCustomRange && dateRange.value) {
                    filters.filter = String(dateRange.value);
                  }
                }
              await exportAdminReports(filters);
            }}
            loading={isExporting}
            disabled={isExporting}
            fullWidth
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </CommonButton>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {dashboardData?.cards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
            <CommonCards {...c} loading={dashboardLoading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6 }}>
          <LineChart
            title="App Engagement Trends"
            chart={
              dashboardData?.appEngagementTrend || {
                data: [],
                labels: {},
                colors: {},
              }
            }
            loading={dashboardLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6 }}>
          <BarChart
            title="Content Performance"
            chart={
              dashboardData?.contentPerformance || {
                data: [],
                labels: {},
                colors: {},
              }
            }
            loading={dashboardLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* LEFT — 30% */}
        <Grid size={{ xs: 12, lg: 4, xl: 4 }}>
          <PieChart
            title="Headcounts"
            data={dashboardData?.headcounts || []}
            loading={dashboardLoading}
          />
        </Grid>

        {/* RIGHT — 70% */}
        <Grid size={{ xs: 12, lg: 8, xl: 8 }}>
          <Box
            sx={{
              background: "background.paper",
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              padding: "24px",
              width: "100%",
            }}
          >
            <Typography
              variant="h6"
              color="text.primary"
              sx={{
                margin: 0,
                mb: 3,
              }}
            >
              Performance by User
            </Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <CommonTable
                title="Performance By User"
                scrollHeight={295}
                columns={PERFORMANCE_USER_COLUMNS}
                data={performanceUsers}
                loading={performanceLoading}
                isFetching={performanceFetching}
                pageMeta={pagination}
                onPageChange={changePage}
                onRowsPerPageChange={changeLimit}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
export default AdminAnalyticsView;
