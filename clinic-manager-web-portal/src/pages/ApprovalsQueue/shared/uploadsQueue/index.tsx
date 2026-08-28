import {
  Box,
  Grid,
  Modal,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  BaseSelect,
  BaseTextField,
  CommonButton,
  CommonCards,
  CommonIcon,
  CommonIconButton,
  Modal as CommonModal,
  CommonTextField,
  DateFilter,
  DateRangeFilter,
  EmptyStateLoader,
} from "@/components/common";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
import { useDropdown } from "@/hooks/useDropdown";
import { useSavedFilters } from "@/hooks/useSavedFilters";
import { DropdownType } from "@/services";
import { SavedFilter } from "@/types/savedFilter";
import { SelectOption } from "@/types/select";
import { enableDayjsUTC } from "@/utils/date";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { DateRangeValue } from "@/types/dateRange";
import { useUserUploadApprovals } from "../hooks/uploadHooks/useUserUploadApprovals";
import { useUploadUserDetails } from "../hooks/uploadHooks/useUserUploadDetails";
import UserUploadsApprovalDetails from "./userUploadDetails";
import UserUploadsApprovalsList from "./userUploadList";
import ViewUserUpload from "./ViewUserUpload";
enableDayjsUTC();

const UserUploads = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery("(max-width:1400px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const headerAreaHeight = theme.spacing(18);

  const { options: taskTypeOptions, loading: taskTypeLoading } = useDropdown(
    DropdownType.APPROVALS_TASK_UPLOAD_TYPE,
  );

  const { options: statusOptions, loading: statusLoading } =
    useDropdown(DropdownType.FORM_APPROVAL_STATUS);

  const {
    approvals,
    cardsCounts,
    loading,
    isFetching,
    selectedId,
    updateFilters,
    selectApproval,
    refetch,
    filters,
  } = useUserUploadApprovals();

  const { loading: detailsLoading, refetch: refetchDetails } =
    useUploadUserDetails(selectedId);

  const [viewMode, setViewMode] = useState<"details" | "form">("details");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMobileViewingDetails, setMobileViewingDetails] = useState(false);
  const [isFilterChangePending, setIsFilterChangePending] = useState(false);
  const [dateRange, setDateRange] = useState<SelectOption | null>(null);
  const [customRange, setCustomRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });
  const [formOpened, setFormOpened] = useState(false);

  // Trigger flag when filters change
  useEffect(() => {
    setIsFilterChangePending(true);
  }, [filters]);

  // AUTO-SELECT FIRST ITEM ONLY ON FILTER CHANGE
  const isEmpty = !loading && approvals.length === 0;

  useEffect(() => {
    if (!isFetching && isFilterChangePending) {
      if (approvals.length > 0) {
        const firstId = approvals[0].id;
        // if ID is same as current, manually refresh details since hook won't trigger
        if (selectedId === firstId) {
          refetchDetails?.();
        }
        selectApproval(firstId);
        setMobileViewingDetails(false); // Open list panel
      } else {
        selectApproval(null);
      }
      setViewMode("details"); // Close form on desktop
      setIsFormModalOpen(false); // Close modal on mobile
      setIsFilterChangePending(false); // Reset flag
    }
  }, [isFetching, approvals, isFilterChangePending, selectedId, refetchDetails]);

  const selectedApproval = approvals.find((a) => a.id === selectedId);

  // Local filter UI state

  const [search, setSearch] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<any | null>(null);

  // Get date filter options from master dropdown
  const { options: dateFilterOptions } = useDropdown(
    DropdownType.DATE_FILTER_TYPE,
    false,
  );

  const isCustomRange =
    dateFilterOptions.find((opt) => opt.value === dateRange?.value)?.label ===
    "Custom Range";

  const [activeFilter, setActiveFilter] = useState<SavedFilter | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [error, setError] = useState("");

  const {
    filters: savedFilters,
    saveFilter,
    deleteFilter,
  } = useSavedFilters("STAFF_APPROVALS_UPLOAD");
  const validateFilterName = (value: string) => {
    if (!value) return "Filter name is required";
    if (!value.trim()) return "Filter name cannot contain only spaces";
    if (value !== value.trim())
      return "Filter name cannot start or end with spaces";
    return "";
  };

  const savedFilterOptions: SelectOption[] = savedFilters?.map((f) => ({
    label: f.filterName,
    value: f.id,
  }));

  const handleFilterNameChange = (e: any) => {
    const value = e.target.value;
    setFilterName(value);
    setError(validateFilterName(value));
  };

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

  // Sync dateFilterParams into the hook filters whenever they change
  useEffect(() => {
    updateFilters({
      date: null, // clear old single-date filter
      startDate: dateFilterParams?.startDate ?? undefined,
      endDate: dateFilterParams?.endDate ?? undefined,
      dateFilter: dateFilterParams?.filter ?? undefined,
    });
  }, [dateFilterParams]);

  const handleSelectSavedFilter = (filterId: string) => {
    const selected = savedFilters?.find((f) => f.id === filterId);
    if (!selected) return;

    setActiveFilter(selected);
    const f = selected.filterData;

    setSearch(f.search ?? "");
    const matchedTaskType =
      taskTypeOptions.find(
        (opt) => String(opt.value) === String(f.taskTypeFilter),
      ) ?? null;

    const matchedStatus =
      statusOptions.find(
        (opt) => String(opt.value) === String(f.statusFilter),
      ) ?? null;

    setTaskTypeFilter(matchedTaskType);
    setStatusFilter(matchedStatus);

    const matchedRange =
      dateFilterOptions.find(
        (opt) => String(opt.value) === String(f.dateFilter),
      ) ?? null;

    setDateRange(matchedRange);

    if (f.startDate && f.endDate) {
      setCustomRange({
        startDate: dayjs(f.startDate),
        endDate: dayjs(f.endDate),
      });
    } else {
      setCustomRange({ startDate: null, endDate: null });
    }

    updateFilters(f);
  };

  const buildCurrentFilters = () => ({
    search: search || null,
    taskTypeFilter: taskTypeFilter?.value ?? null,
    statusFilter: statusFilter?.value ?? null,
    dateFilter: dateFilterParams?.filter ?? null,
    startDate: dateFilterParams?.startDate ?? null,
    endDate: dateFilterParams?.endDate ?? null,
  });

  const resetAllFilters = () => {
    setSearch("");
    setTaskTypeFilter(null);
    setStatusFilter(null);
    setDateRange(null);
    setCustomRange({ startDate: null, endDate: null });
    setActiveFilter(null);

    updateFilters({
      search: undefined,
      taskTypeFilter: undefined,
      statusFilter: undefined,
      date: null,
      startDate: undefined,
      endDate: undefined,
      dateFilter: undefined,
    });
  };
  const buildFilterName = () => {
    const parts: string[] = [];
    if (search) parts.push(search);
    if (taskTypeFilter) parts.push(taskTypeFilter.label);
    if (statusFilter) parts.push(statusFilter.label);
    if (dateRange) parts.push(dateRange.label);
    return parts.length ? parts.join(" • ") : "My Approval Filter";
  };

  const handleDeleteSavedFilter = (filterId: string) => {
    if (activeFilter?.id === filterId) {
      setActiveFilter(null);
      resetAllFilters();
    }
    deleteFilter(filterId);
  };

  const hasActiveFilters = () =>
    Boolean(search || taskTypeFilter || statusFilter || dateRange);

  const handleApprovalActionSuccess = async () => {
    await refetch(); // reload list
    await refetchDetails?.(); // refresh details panel to update buttons status
  };

  const cards = [
    {
      id: 1,
      title: "Total",
      value: cardsCounts?.total ?? 0,
      iconName: "FileText",
      variant: "white",
    },
    {
      id: 2,
      title: "Approved",
      value: cardsCounts?.approved ?? 0,
      iconName: "CircleCheck",
      variant: "green",
    },
    {
      id: 3,
      title: "Pending Approvals",
      value: cardsCounts?.pending ?? 0,
      iconName: "ClipboardClock",
      variant: "orange",
    },
    {
      id: 4,
      title: "Rejected Approvals",
      value: cardsCounts?.rejected ?? 0,
      iconName: "AlertTriangle",
      variant: "red",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* cards */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <CommonCards {...c} loading={loading} />
          </Grid>
        ))}
      </Grid>
      {/* search and filters bar */}

      <Box
        sx={{
          p: isMobile ? 1.5 : 2,
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "background.paper",
          mb: 3,
        }}
      >
        <Grid container spacing={2}>
          {/* Search */}
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: isCustomRange ? 6 : 4,
              lg: isCustomRange ? 3 : 4,
              xl: isCustomRange ? 3 : 4,
            }}
          >
            <BaseTextField
              placeholder="Search by task name or patient name"
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                updateFilters({ search: value || undefined });
              }}
            />
          </Grid>

          {/* task type */}

          <Grid
            size={{
              xs: 12,
              sm: isCustomRange ? 6 : 6,
              md: isCustomRange ? 6 : 4,
              lg: isCustomRange ? 3 : 2,
              xl: isCustomRange ? 3 : 2,
            }}
          >
            <BaseSelect
              placeholder="Task type"
              value={taskTypeFilter}
              options={taskTypeOptions}
              onChange={(value) => {
                setTaskTypeFilter(value);

                updateFilters({
                  taskTypeFilter:
                    !value || value.value === "All"
                      ? undefined
                      : String(value.value),
                });
              }}
            />
          </Grid>
          {/* status */}
          <Grid
            size={{
              xs: 12,
              sm: isCustomRange ? 6 : 6,
              md: isCustomRange ? 6 : 4,
              lg: isCustomRange ? 3 : 2,
              xl: isCustomRange ? 3 : 2,
            }}
          >
            <BaseSelect
              placeholder="Status"
              value={statusFilter}
              options={statusOptions}
              onChange={(value) => {
                setStatusFilter(value);

                updateFilters({
                  statusFilter:
                    !value || value.value === "All"
                      ? undefined
                      : String(value.value),
                });
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: isCustomRange ? 6 : 4,
              lg: isCustomRange ? 3 : 2,
              xl: isCustomRange ? 3 : 2,
            }}
            sx={{ display: "flex", justifyContent: "flex-end" }}
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
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 3 }}>
              <DateRangeFilter
                disableFuture
                placeholder
                value={customRange}
                onChange={setCustomRange}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2, xl: 2 }}>
            <Tooltip
              title={
                hasActiveFilters() ? "" : "Apply at least one filter to save"
              }
            >
              <CommonButton
                fullWidth
                variant="outlined"
                isBaseHeight
                startIcon={<CommonIcon name="Save" />}
                disabled={!hasActiveFilters()}
                onClick={() => {
                  setFilterName(buildFilterName());
                  setSaveModalOpen(true);
                }}
              >
                Save Filter
              </CommonButton>
            </Tooltip>
          </Grid>

          {/* My Filters */}
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2, xl: 2 }}>
            <BaseSelect
              placeholder="My Filters"
              primary
              startIcon={<CommonIcon name="Funnel" />}
              value={
                activeFilter
                  ? {
                      label: activeFilter.filterName,
                      value: activeFilter.id,
                    }
                  : null
              }
              options={savedFilterOptions}
              noOptionsText="No saved filters"
              renderOption={(props, option) => (
                <Box
                  {...props}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 1,
                    maxWidth: "100%",
                  }}
                >
                  <Tooltip
                    title={option.label}
                    placement="right"
                    arrow
                    disableHoverListener={option.label.length < 30}
                  >
                    <Box
                      sx={{
                        maxWidth: "160px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        fontSize: "14px",
                      }}
                    >
                      {option.label}
                    </Box>
                  </Tooltip>
                  <CommonIconButton
                    sx={{ ml: "auto" }}
                    color="error"
                    tooltip="Delete"
                    icon={<CommonIcon name="Trash2" size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSavedFilter(String(option.value));
                    }}
                  />
                </Box>
              )}
              onChange={(option) => {
                if (!option) {
                  resetAllFilters();
                  return;
                }
                handleSelectSavedFilter(String(option.value));
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {isEmpty && (
        <EmptyStateLoader
          title={search ? `No results for "${search}"` : "No approvals found"}
          subtitle="Try adjusting filters or check back later"
          height={260}
          icon="FileX"
        />
      )}
      {!isEmpty && (
        <>
          {/* MOBILE VIEW HANDLING */}
          {isBelowMd ? (
            <>
              {/* Show LIST only */}
              {!isMobileViewingDetails &&
                (loading ? (
                  <CommonSkeleton type="approvalList" rows={8} />
                ) : (
                  <UserUploadsApprovalsList
                    approvals={approvals}
                    selectedId={selectedId}
                    onSelect={(id) => {
                      selectApproval(id);
                      setIsFormModalOpen(false); // Close form if open
                      setMobileViewingDetails(true);
                    }}
                  />
                ))}

              {/* Show DETAILS only */}
              {isMobileViewingDetails &&
                (detailsLoading ? (
                  <CommonSkeleton type="approvalDetails" />
                ) : (
                  // <UserUploadsApprovalDetails
                  //   approvalId={selectedId}
                  //   onBack={() => setMobileViewingDetails(false)}
                  //   onOpenForm={() => setIsFormModalOpen(true)}
                  //   onActionSuccess={handleApprovalActionSuccess}
                  // />
                  <UserUploadsApprovalDetails
                    approvalId={selectedId}
                    onBack={() => setMobileViewingDetails(false)}
                    onOpenForm={() => {
                      setFormOpened(true);
                      setIsFormModalOpen(true);
                    }}
                    onActionSuccess={handleApprovalActionSuccess}
                    formOpened={formOpened}
                  />
                ))}
            </>
          ) : (
            /* DESKTOP — normal 2-column layout */
            <Grid
              container
              spacing={3}
              sx={{
                height: `calc(100vh - ${headerAreaHeight}px)`,
                overflow: "hidden",
              }}
            >
              <Grid size={{ xs: 12, md: viewMode === "form" ? 3 : 4 }}>
                {loading ? (
                  <CommonSkeleton type="approvalList" rows={8} />
                ) : (
                  <UserUploadsApprovalsList
                    approvals={approvals}
                    selectedId={selectedId}
                    onSelect={(id) => {
                      selectApproval(id);
                      setViewMode("details"); // Close form if open
                      setFormOpened(false);
                    }}
                  />
                )}
              </Grid>

              {/* MIDDLE FORM PANEL (only when viewing form) */}
              {viewMode === "form" && (
                <Grid size={{ xs: 12, md: 5 }}>
                  <ViewUserUpload
                    submissionId={selectedId}
                    onClose={() => setViewMode("details")}
                  />
                </Grid>
              )}

              {/* RIGHT DETAILS PANEL */}
              <Grid size={{ xs: 12, md: viewMode === "form" ? 4 : 8 }}>
                {detailsLoading ? (
                  <CommonSkeleton type="approvalDetails" />
                ) : (
                  // <UserUploadsApprovalDetails
                  //   approvalId={selectedId}
                  //   onOpenForm={() => setViewMode("form")}
                  //   onActionSuccess={handleApprovalActionSuccess}
                  // />
                  <UserUploadsApprovalDetails
                    approvalId={selectedId}
                    onOpenForm={() => {
                      setFormOpened(true);
                      setViewMode("form");
                    }}
                    onActionSuccess={handleApprovalActionSuccess}
                    formOpened={formOpened}
                  />
                )}
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/*  FORM — MODAL (always floats) */}

      {/* <Modal open={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}> */}
      <Modal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setFormOpened(false);
        }}
      >
        <Box
          // sx={{
          //   width: "65%",
          //   maxWidth: 700,
          //   height: "75%",
          //   maxHeight: 700,
          //   mx: "auto",
          //   mt: 5,
          //   outline: "none",
          // }}
          sx={{
            width: isMobile ? "95%" : "65%", // Wider on mobile for better fit
            maxWidth: 700,
            height: isMobile ? "auto" : "75%", // Allow it to grow with content
            maxHeight: isMobile ? "90vh" : "700", // Cap at 90% of screen height on mobile
            overflowY: "auto",
            mx: "auto",
            mt: isMobile ? 2 : 5, // Less top margin on mobile
            outline: "none",
          }}
        >
          {/* <ViewUserUpload
            submissionId={selectedId}
            onClose={() => setIsFormModalOpen(false)}
          /> */}
          <ViewUserUpload
            submissionId={selectedId}
            onClose={() => {
              // setViewMode("details");
              setFormOpened(false);
              setIsFormModalOpen(false);
            }}
          />
        </Box>
      </Modal>

      {/* Save Filter Modal */}
      <CommonModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Filter"
        actions={
          <>
            <CommonButton
              variant="outlined"
              onClick={() => setSaveModalOpen(false)}
            >
              Cancel
            </CommonButton>

            <CommonButton
              variant="contained"
              onClick={() => {
                saveFilter({
                  filterName: filterName,
                  filterData: buildCurrentFilters(),
                });
                setSaveModalOpen(false);
              }}
            >
              Save
            </CommonButton>
          </>
        }
      >
        <CommonTextField
          label="Filter name"
          fullWidth
          value={filterName}
          onChange={handleFilterNameChange}
          required
          error={!!error}
          helperText={error}
        />
      </CommonModal>
    </Box>
  );
};

export default UserUploads;
