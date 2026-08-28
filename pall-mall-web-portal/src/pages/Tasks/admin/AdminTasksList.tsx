import { Box, useTheme, Grid, useMediaQuery } from "@mui/material";
import { TopProgressBar } from "@/components/common";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import PageContainer from "@/components/layouts/PageContainer";
import {
  CommonPageHeader,
  CommonButton,
  CommonIcon,
  CommonCards,
  // CommonTable,
} from "@/components/common";
// import { Column } from "@/components/common/CommonTable";
// import  CommonTable  from "@/components/common/CommonTable";
// import  {Column}  from "@/components/common/commonTable/types";
import { CommonTable } from "@/components/common";
import type { Column } from "@/components/common";
import {
  BaseSelect,
  BaseTextField,
  CommonIconButton,
  CommonTextField,
  Modal,
  DateFilter,
  DateRangeFilter,
} from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { DATE_FORMATS } from "@/constants";
import { format } from "date-fns";
import { DateRangeValue } from "@/types/dateRange";
import CreateTaskModal from "../admin/CreateTask/CreateTaskModal";
import { useTasks } from "../hooks/useTasks";
import { useTaskExport } from "../hooks/useTaskExport";
import { SelectOption } from "@/types/select";
import { useSavedFilters } from "@/hooks/useSavedFilters";
import { SavedFilter } from "@/types/savedFilter";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { Tooltip } from "@mui/material";
import { toast } from "@/utils/toast";



const patientcolumns: Column[] = [
  { id: "patientName", label: "Patient Name" },
  { id: "procedureType", label: "Procedure Type" },
  { id: "phase", label: "Phase" },
  { id: "task_name", label: "Task Name" },
  { id: "status", label: "Status", color: true },
  {
    id: "due_date",
    label: "Due Date",
    sortable: true,
    sortKey: "dueDateOrder",
  },
  { id: "assigneeName", label: "Assignee" },
  { id: "actions", label: "Actions", actionType: "view" },
];

const AdminTasksList = () => {
  const { options: procedureOptions, loading: procedureLoading } = useDropdown(
    DropdownType.PROCEDURE_TYPE
  );
  const { options: phaseOptions, loading: phaseLoading } = useDropdown(
    DropdownType.TASK_PHASE
  );
  const { options: statusOptions, loading: statusLoading } = useDropdown(
    DropdownType.TASK_STATUS
  );
  const { options: dateFilterOptions } = useDropdown(
    DropdownType.TASK_DATE_FILTER_TYPE,
    false,
  );
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [procedure, setProcedure] = useState<SelectOption | null>(null);
  const [phase, setPhase] = useState<SelectOption | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SelectOption | null>(null);
  const [dateRange, setDateRange] = useState<SelectOption | null>(null);
  const [customRange, setCustomRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });
  const [activeFilter, setActiveFilter] = useState<SavedFilter | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    filterId: string | null;
  }>({
    open: false,
    filterId: null,
  });

  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const isCustomRange =
    dateFilterOptions.find((opt) => opt.value === dateRange?.value)?.label ===
    "Custom Range";

  // Export hook
  const { exportTasks, isExporting } = useTaskExport();

  const {
    filters: savedFilters,
    saveFilter,
    deleteFilter,
    loading: savingFilterLoading
  } = useSavedFilters("TASKS");

  /* ----------------------------------
   * Tasks hook (API)
   * ---------------------------------- */
  const {
    tasks,
    statusCounts,
    pagination,
    loading,
    isFetching,
    updateFilters,
    updateSort,
    changePage,
    changeLimit,
    refresh,
  } = useTasks();

  const handleView = (taskId) => {
    navigate(ROUTES.TASKS_DETAIL.replace(":taskId", taskId));
  };

  /* ----------------------------------
   * Summary Cards (API driven)
   * ---------------------------------- */
  const cards = [
    {
      id: 1,
      title: "Total Tasks",
      value: statusCounts.total ?? 0,
      iconName: "Users",
      variant: "green",
    },
    {
      id: 2,
      title: "Pending",
      value: statusCounts.Pending ?? 0,
      iconName: "ClipboardClock",
      variant: "orange",
    },
    {
      id: 3,
      title: "In Progress",
      value: statusCounts.Inprogress ?? 0,
      iconName: "Loader",
      variant: "blue",
    },
    {
      id: 4,
      title: "Overdue",
      value: statusCounts.Overdue ?? 0,
      iconName: "Clock",
      variant: "red",
    },
    {
      id: 5,
      title: "Completed",
      value: statusCounts.Completed ?? 0,
      iconName: "CircleCheck",
      variant: "green",
    },
  ];
const validateFilterName = (value) => {
  if (!value) {
    return "Filter Name is required";
  }

  if (!value.trim()) {
    return "Filter Name cannot contain only spaces";
  }
  if (value !== value.trim()) {
    return "Filter Name cannot start or end with spaces";
  }

  return "";
};

  // Prepare date filter parameters
  const dateFilterParams = useMemo(() => {
    if (!dateRange) return undefined;

    if (isCustomRange && customRange.startDate && customRange.endDate) {
      return {
        startDate: format(customRange.startDate.toDate(), "yyyy-MM-dd"),
        endDate: format(customRange.endDate.toDate(), "yyyy-MM-dd"),
        filter: String(dateRange.value),
      };
    }

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
      dueDate: null, // clear old single-date filter
      startDate: dateFilterParams?.startDate ?? undefined,
      endDate: dateFilterParams?.endDate ?? undefined,
      dateFilter: dateFilterParams?.filter ?? undefined,
    });
  }, [dateFilterParams]);

  const savedFilterOptions: SelectOption[] = savedFilters?.map((f) => ({
    label: f.filterName,
    value: f.id,
  }));

  const handleChange = (e) => {
  const value = e.target.value;
  setFilterName(value);
  setError(validateFilterName(value));
};


  const handleSelectSavedFilter = (filterId: string) => {
    const selected = savedFilters?.find((f) => f.id === filterId);
    if (!selected) return;

    setActiveFilter(selected);
    const f = selected.filterData;

    setSearch(f.search ?? "");

    setProcedure(
      procedureOptions.find((o) => o.value === f.procedureType) ?? null
    );

    setPhase(phaseOptions.find((o) => o.value === f.phases) ?? null);

    setStatus(
      f.status
        ? statusOptions.find((o) => o.value === f.status) ?? statusOptions[0]
        : statusOptions[0]
    );

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
    procedureType: procedure?.value ?? null,
    phases: phase?.value ?? null,
    status:  status?.value ?? null,
    dateFilter: dateFilterParams?.filter ?? null,
    startDate: dateFilterParams?.startDate ?? null,
    endDate: dateFilterParams?.endDate ?? null,
  });

  const resetAllFilters = () => {
    setSearch("");
    setProcedure(null);
    setPhase(null);
    setStatus(null);
    setDateRange(null);
    setCustomRange({ startDate: null, endDate: null });
    setActiveFilter(null);

    updateFilters({
      search: null,
      procedureType: null,
      phases: null,
      status: null,
      dueDate: null,
      startDate: undefined,
      endDate: undefined,
      dateFilter: undefined,
    });
  };

  const buildFilterName = () => {
    const parts: string[] = [];
    if (search) parts.push(search);
    if (procedure) parts.push(procedure.label);
    if (phase) parts.push(phase.label);
    if (status) parts.push(status.label);
    if (dateRange) parts.push(dateRange.label);

    let name = parts.length ? parts.join(" • ") : "My Task Filter";

    return name;
  };

  const handleDeleteSavedFilter = (filterId: string) => {
    if (activeFilter?.id === filterId) {
      setActiveFilter(null);
      resetAllFilters();
    }

    return deleteFilter(filterId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.filterId) return;

    // handleDeleteSavedFilter(deleteConfirm.filterId);
    try {
      await handleDeleteSavedFilter(deleteConfirm.filterId);

      // toast.success("Filter deleted successfully");
    } catch (err) {
      // toast.error("Failed to delete filter");
    }

    setDeleteConfirm({ open: false, filterId: null });
  };

  const hasActiveFilters = () => {
    return Boolean(search?.trim() || procedure || phase || status || dateRange);
  };

  /* ----------------------------------
   * Export Handler
   * ---------------------------------- */
  const handleExport = async () => {
    // Build current filter params
    const filters = {
      search: search || "",
      procedureType: procedure?.value === "All" ? "" : String(procedure?.value || ""),
      phases: phase?.value === "All" ? "" : String(phase?.value || ""),
      status: status?.value === "All" ? "" : String(status?.value || ""),
      start_date: dateFilterParams?.startDate || "",
      end_date: dateFilterParams?.endDate || "",
      date_filter: dateFilterParams?.filter || "",
    };

    // Call the export hook
    await exportTasks(filters);
  };

  const handleCloseSaveModal = () => {
  setSaveModalOpen(false);
  setError("");
};


  return (
    <PageContainer>
      {/* Header */}
      <Grid container justifyContent="space-between">
        <Grid size={{ xs: 12, md: 8 }}>
          <CommonPageHeader
            title="Task Management"
            subtitle="Track and manage patient tasks across all phases"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          {/* <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "flex-end",
              gap: 1,
              mt: { xs: 2, md: 0 },
            }}
          > */}
          <Grid container spacing={1} justifyContent="flex-end">
            <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
              <CommonButton
                fullWidth
                variant="outlined"
                startIcon={<CommonIcon name="Download" />}
                onClick={handleExport}
                loading={isExporting}
                // disabled={isExporting}
                 disabled={isExporting || tasks.length === 0}
              >
                {isExporting ? "Preparing export…" : "Export"}
              </CommonButton>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
              <CommonButton
                fullWidth
                variant="contained"
                startIcon={<CommonIcon name="Plus" />}
                onClick={() => setOpenTaskModal(true)}
              >
                New Task
              </CommonButton>
            </Grid>
          </Grid>
          {/* </Box> */}
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <CommonCards {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box
        sx={{
          p: isMobile ? 1.5 : 2,
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "#fff",
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: isCustomRange ? 6 : 12, md: isCustomRange ? 6 : 8, lg: isCustomRange ? 3 : 3.2, xl: 2.5 }}>
            <BaseTextField
              placeholder="Search by patient, procedure, or task..."
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);
                updateFilters({ search: value || null });
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: isCustomRange ? 6 : 4, lg: isCustomRange ? 3 : 2.2, xl: 1.7 }}>
            <BaseSelect
              placeholder="Procedure"
              value={procedure}
              options={procedureOptions}
              onChange={(value) => {
                setProcedure(value);
                updateFilters({
                  procedureType:
                    !value || value.value === "All"
                      ? undefined
                      : String(value.value),
                });
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: isCustomRange ? 6 : 4, lg: isCustomRange ? 3 : 2.2, xl: 1.7 }}>
            <BaseSelect
              placeholder="Status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                updateFilters({
                  status:
                    !value || value.value === "All"
                      ? null
                      : String(value.value),
                });
              }}
              options={statusOptions}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: isCustomRange ? 6 : 4, lg: isCustomRange ? 3 : 2.2, xl: 1.7 }}>
            <BaseSelect
              placeholder="Phase"
              value={phase}
              options={phaseOptions}
              onChange={(value) => {
                setPhase(value);
                updateFilters({
                  phases:
                    !value || value.value === "All"
                      ? undefined
                      : String(value.value),
                });
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: isCustomRange ? 6 : 4, lg: isCustomRange ? 3 : 2.2, xl: isCustomRange ? 1.7 : 1.5 }}>
            <BaseSelect
              placeholder="Due Date"
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
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3, xl: 2.7 }}>
              <DateRangeFilter
                disableFuture
                placeholder
                value={customRange}
                onChange={setCustomRange}
              />
            </Grid>
          )}
          <Grid
            container
            size={{ xs: 12, sm: 12, md: 12, lg: isCustomRange ? 6 : 12, xl: 2.9 }}
            sx={{ display: "flex", justifyContent: "flex-end" }}
            spacing={2}
          >
            <Tooltip
              title={
                hasActiveFilters() ? "" : "Apply at least one filter to save"
              }
            >
              {/* <span> */}
              <Grid size={{ xs: 12, sm: 6, md: isCustomRange ? 6 : 4, lg: isCustomRange ? 6 : 2.2, xl: 6 }}>
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
              </Grid>
              {/* </span> */}
            </Tooltip>

            {/* My Filters */}
            <Grid size={{ xs: 12, sm: 6, md: isCustomRange ? 6 : 4, lg: isCustomRange ? 6 : 2.2, xl: 6 }}>
              <BaseSelect
                placeholder="My Filters"
                primary
                startIcon={<CommonIcon name="Funnel" />}
                value={
                  activeFilter
                    ? { label: activeFilter.filterName, value: activeFilter.id }
                    : null
                }
                options={savedFilterOptions}
                noOptionsText="No saved filters"
                renderOption={(props, option) => (
                  <Box
                    component="li"
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
                      disableHoverListener={option.label.length < 15}
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
                        // handleDeleteSavedFilter(String(option.value));
                        setDeleteConfirm({ open: true, filterId: String(option.value) });
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
        </Grid>
      </Box>

      {/* Table */}
        <CommonTable
          columns={patientcolumns}
          data={tasks}
          loading={loading}
          pageMeta={pagination}
          isFetching={isFetching}
          onPageChange={changePage}
          onRowsPerPageChange={changeLimit}
          onViewClick={(row) => handleView(row.id)}
          onSortChange={updateSort}
        />

      {/* Create Task Modal */}
      <CreateTaskModal
        open={openTaskModal}
        onClose={() => setOpenTaskModal(false)}
        onSuccess={() => {
          refresh();
          setOpenTaskModal(false);
        }}
      />
      {/* Save Filter Modal */}
      <Modal
        open={saveModalOpen}
        // onClose={() => setSaveModalOpen(false)}
        onClose={savingFilterLoading ? undefined : handleCloseSaveModal}
        title="Save Filter"
        actions={
          <Box sx={{ pb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <CommonButton
                variant="outlined"
                onClick={() => setSaveModalOpen(false)}
              >
                Cancel
              </CommonButton>

              <CommonButton
                loading={savingFilterLoading}
                variant="contained"
                disabled={!!error || !filterName.trim()}
                onClick={async () => {
                  if (error) return;   

                  await saveFilter({
                    filterName: filterName.trim(),
                    filterData: buildCurrentFilters(),
                  });

                 handleCloseSaveModal();
                }}
              // onClick={async () => {
              //   await saveFilter({
              //     filterName: filterName,
              //     filterData: buildCurrentFilters(),
              //   });
              //   setSaveModalOpen(false);
              // }}
              >
                Save
              </CommonButton>
            </Box>
          </Box>
        }
      >

        <CommonTextField
          label="Filter Name"
          fullWidth
          value={filterName}
          onChange={handleChange}
          required
          error={!!error}
          helperText={error}
        />

      </Modal>
      {/* Delete Filter Confirm Modal */}
      <Modal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, filterId: null })}
        title="Delete Filter"
        actions={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:10,padding: '0 3px 5px' }}>
            <CommonButton
              variant="outlined"
              onClick={() => setDeleteConfirm({ open: false, filterId: null })}
            >
              Cancel
            </CommonButton>

            <CommonButton
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
            >
              Delete
            </CommonButton>
          </div>
        }
      >
        Are you sure you want to delete this saved filter?
      </Modal>
    </PageContainer>
  );
};

export default AdminTasksList;
