import { useAppDispatch, useAppSelector } from "@/app/store";
import {
  BaseSelect,
  BaseTextField,
  CommonButton,
  CommonSelect,
  CommonTextField,
  // CommonTable,
  CommonPageHeader,
  CommonIcon,
  Modal,
  DateFilter,
  CommonCards,
} from "@/components/common";
// import { Column } from "@/components/common/CommonTable";
// import  CommonTable  from "@/components/common/commonTable/CommonTable.tsx";
// import  {Column}  from "@/components/common/commonTable/types";
import { CommonTable } from "@/components/common";
import type { Column } from "@/components/common";
import PageContainer from "@/components/layouts/PageContainer";
import { Box, Grid, useTheme, Typography, Chip } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { setPatientList } from "@/features/Patient/slice";
// import CommonSkeleton from "@/components/common/CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";
// import CommonTable from "@/components/common/commonTable/CommonTable";
interface OptionType {
  label: string;
  value: string | number;
}

const statusOptions = [
  { label: "All", value: "All" },
  { label: "On Track", value: "On Track" },
  { label: "Needs Attention", value: "Needs Attention" },
  { label: "Completed", value: "Completed" },
];
const statusOptionss = [
  { label: "On Track", value: "On Track" },
  { label: "Needs Attention", value: "Needs Attention" },
  { label: "Completed", value: "Completed" },
];

const filterOptions = [
  { label: "All", value: "All" },
  { label: "Procedure Type", value: "Procedure Type" },
  { label: "Patient Name", value: "Patient Name" },
  { label: "Task Name", value: "Task Name" },
  { label: "Phase", value: "Phase" },
];

const PatientTracker = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const PatientpageMeta = useAppSelector((state) => state.patient.PageMeta);
  const patientData = useAppSelector((state) => state.patient.PatientList);
  const [filter, setFilter] = useState<OptionType | null>(null);
  const [update, setUpdate] = useState<OptionType | null>(statusOptionss[0]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [status, setStatus] = useState<OptionType | null>(statusOptions[0]);
  const currentStatusOption = selectedPatient
    ? statusOptionss.find((o) => o.value === selectedPatient.status) || null
    : null;

  const [newNote, setNewNote] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [rows, setRows] = useState<any[]>([]);
  const [pageMeta, setPageMeta] = useState(PatientpageMeta);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setRows(patientData);
      setPageMeta(PatientpageMeta);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [patientData, PatientpageMeta]);

  const dispatch = useAppDispatch();

  // const PatientModalSkeleton = () => (
  //   <Box>
  //     {/* Header */}
  //     <Box sx={{ mb: 3 }}>
  //       <CommonSkeleton type="text" width={200} />
  //       <CommonSkeleton type="text" width={120} />
  //     </Box>

  //     <Box
  //       sx={{
  //         display: "grid",
  //         gridTemplateColumns: "1fr 1fr",
  //         gap: 2,
  //         mb: 3,
  //       }}
  //     >
  //       {Array.from({ length: 4 }).map((_, i) => (
  //         <Box key={i}>
  //           <CommonSkeleton type="text" width={80} />
  //           <CommonSkeleton type="text" width={140} />
  //         </Box>
  //       ))}
  //     </Box>

  //     {/* Notes */}
  //     <Box sx={{ mb: 3 }}>
  //       <CommonSkeleton type="text" width={160} />
  //       <CommonSkeleton type="text" rows={3} />
  //     </Box>

  //     {/* Status */}
  //     <CommonSkeleton type="text" width={120} height={36} />

  //     {/* Buttons */}
  //     <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
  //       <CommonSkeleton type="text" width={80} height={36} />
  //       <CommonSkeleton type="text" width={120} height={36} />
  //     </Box>
  //   </Box>
  // );

  const userColumns: Column[] = [
    {
      id: "patientName",
      label: "Patient",
      patient: true,
      patientNameKey: "patientName",
      patientIdKey: "patientId",
      patientAvatarKey: "avatar",
    },

    {
      id: "procedureType",
      label: "Surgery Type",
      surgeryDateKey: "surgeryDate",
      surgeryNameKey: "procedureType",
      surgery: true,
    },

    {
      id: "phase",
      label: "Recovery Day",
      color: true,
    },

    {
      id: "status",
      color: true,
      label: "Status",
      //   sortable: true,
    },

    {
      id: "lastUpdate",
      label: "Last Updated",
    },

    {
      id: "next",
      label: "Next Checkpoint",
    },

    {
      id: "actions",
      label: "Actions",
      actionType: "menu",
      menuItems: [
        {
          label: "View",
          icon: "Eye",
          onClick: (row) => {
            setIsEditMode(false);
            setOpenModal(true);
            setLoading(true);

            setTimeout(() => {
              setSelectedPatient(row);
              setLoading(false);
            }, 500);
          },
        },

        {
          label: "Edit",
          icon: "SquarePen",
          onClick: (row) => {
            setUpdate(null);
            setNewNote("");
            setIsEditMode(true);
            setOpenModal(true);
            setLoading(true);

            setTimeout(() => {
              setSelectedPatient(row);
              setLoading(false);
            }, 500);
          },
        },
      ],
    },
  ];

  const PatientCards = [
    {
      id: 1,
      title: "On Track",
      value: 2,
      iconName: "ClockFading",
      variant: "blue",
    },

    {
      id: 2,
      title: "Needs Attention",
      value: 3,
      iconName: "CircleAlert",
      variant: "red",
    },

    {
      id: 3,
      title: "Completed",
      value: 2,
      iconName: "CircleCheck",
      variant: "green",
    },
  ];

  const handleSaveUpdate = () => {
    if (!selectedPatient) return;

    const updatedPatient = {
      ...selectedPatient,

      currentNotes:
        newNote.trim() !== "" ? newNote : selectedPatient.currentNotes || "",

      status: update.value || selectedPatient.status,

      lastUpdate: dayjs().format("YYYY-MM-DD HH:mm"),
    };

    const newList = patientData.map((p) =>
      p.id === selectedPatient.id ? updatedPatient : p
    );

    dispatch(setPatientList(newList));

    setIsEditMode(false);
    setNewNote("");
    setUpdate(null);
    setOpenModal(false);
  };

  const handlePageChange = (newPage: number) => {
    setPageMeta((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleRowsPerPageChange = (limit: number) => {
    setPageMeta((prev) => ({
      ...prev,
      limit,
      currentPage: 1,
      totalPages: Math.ceil(prev.totalItems / limit),
    }));
  };
  return (
    <PageContainer>
      <Grid
        container
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT TEXT */}
        <Grid size={{ xs: 12, sm: 12, md: 8 }}>
          <Box>
            <CommonPageHeader
              title="Patient Task Tracker"
              subtitle="Monitor patient recovery and manage care checkpoints"
            />
          </Box>
        </Grid>
        {/* BUTTON GROUP */}
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "end",
              width: { xs: "100%", md: "100%", sm: "auto" },
              gap: { xs: 1.5, sm: 1 },
              mt: { xs: 2, sm: 1 },
            }}
          >
            {loading ? (
              <CommonSkeleton type="text" width={120} height={32} />
            ) : (
              <Chip
                label={`${patientData.length} Active Patients`}
                variant="outlined"
                color="primary"
              />
            )}
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        {PatientCards.map((c) => (
          <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
            <CommonCards {...c} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          p: 2,
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: "#fff",
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{
            display: "flex",
            flexWrap: { xs: "wrap", lg: "nowrap" },
          }}
        >
          {/* Search */}
          <Grid size={{ xs: 12, sm: 8, md: 3, lg: 2, xl: 2 }}>
            <BaseTextField placeholder="Search approvals..." />
          </Grid>

          {/* Status dropdown */}
          <Grid size={{ xs: 12, sm: 4, md: 2, lg: 2, xl: 2 }}>
            <BaseSelect
              placeholder="Select Statuses"
              name="statusesType"
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </Grid>

          {/* Spacer — only active on lg & xl */}
          <Grid
            sx={{
              flexGrow: {
                xs: 0,
                sm: 0,
                md: 0,
                lg: 1,
                xl: 2,
              },
            }}
          />

          {/* Date picker */}
          <Grid size={{ xs: 12, sm: 3.5, md: 2.5, lg: 2, xl: 2 }}>
            <DateFilter
              placeholder="Pick a date"
              value={startDate}
              onChange={setStartDate}
            />
          </Grid>

          {/* Save Filter */}
          <Grid size={{ xs: 12, sm: 4, md: 2, lg: 2, xl: 2 }}>
            <CommonButton
              fullWidth
              variant="outlined"
              startIcon={<CommonIcon name="Save" />}
            >
              Save Filter
            </CommonButton>
          </Grid>

          {/* My Filters */}
          <Grid size={{ xs: 12, sm: 4, md: 2.2, lg: 2, xl: 2 }}>
            <BaseSelect
              placeholder="My Filters"
              primary
              name="filterType"
              startIcon={<CommonIcon name="Funnel" />}
              value={filter}
              onChange={setFilter}
              options={filterOptions}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CommonTable
            columns={userColumns}
            data={rows}
            loading={loading}
            // pageMeta={pageMeta}
            // onPageChange={handlePageChange}
            // onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Grid>
      </Grid>

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={`Patient Task - ${selectedPatient?.patientName || ""}`}
      >
        {loading ? (
          <CommonSkeleton type="patientModal" />
        ) : (
          selectedPatient && (
            <Box>
              {/* HEADER INFO */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {selectedPatient.procedureType} — {selectedPatient.phase}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recovery
                </Typography>
              </Box>

              {/* PATIENT DETAILS */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr", 
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}
                  >
                    Patient ID
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedPatient.patientId}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}
                  >
                    Surgery Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedPatient.surgeryDate}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}
                  >
                    Next Checkpoint
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedPatient.next}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}
                  >
                    Current Status
                  </Typography>

                  <Chip
                    label={selectedPatient.status}
                    icon={
                      selectedPatient.status === "On Track" ? (
                        <CommonIcon
                          name="ClockFading"
                          color={theme.palette.background.paper}
                        />
                      ) : selectedPatient.status === "Needs Attention" ? (
                        <CommonIcon
                          name="CircleAlert"
                          color={theme.palette.background.paper}
                        />
                      ) : selectedPatient.status === "Completed" ? (
                        <CommonIcon
                          name="CircleCheck"
                          color={theme.palette.background.paper}
                        />
                      ) : null
                    }
                    sx={{
                      backgroundColor:
                        selectedPatient.status === "On Track"
                          ? "info.main"
                          : selectedPatient.status === "Needs Attention"
                          ? "error.main"
                          : selectedPatient.status === "Completed"
                          ? "success.main"
                          : null,
                      color: "background.paper",
                    }}
                  />
                </Box>
              </Box>

              {/* CURRENT NOTES */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Current Nurse Notes:
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: "1px solid #e9ecef",
                    background: "#F7F9FC",
                    lineHeight: 1.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {selectedPatient.currentNotes ||
                      "Swelling within normal range. Patient following care instructions well."}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                    color="text.secondary"
                  >
                    Last updated: {selectedPatient.lastUpdate}
                  </Typography>
                </Box>
              </Box>

              {/* ADD NEW NOTE */}
              <Box sx={{ mb: 3 }}>
                {isEditMode ? (
                  <CommonTextField
                    fullWidth
                    autoHeight
                    multiline
                    rows={3}
                    label="Add Progress Note"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                ) : null}
              </Box>

              {/* UPDATE STATUS */}
              <Box>
                <CommonSelect
                  label="Status"
                  value={isEditMode ? update : currentStatusOption}
                  onChange={(v) => setUpdate(v)}
                  options={statusOptionss}
                  disabled={!isEditMode}
                />
              </Box>

              {/* ACTION BUTTONS */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                  justifyContent: "flex-end",
                  borderTop: "1px solid #e9ecef",
                  pt: 2,
                  mt: 3,
                }}
              >
                <CommonButton
                  variant="outlined"
                  onClick={() => setOpenModal(false)}
                >
                  Close
                </CommonButton>

                {!isEditMode && (
                  <CommonButton
                    variant="contained"
                    startIcon={<CommonIcon name="SquarePen" />}
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setIsEditMode(true);
                        setLoading(false);
                      }, 500);
                    }}
                  >
                    Edit
                  </CommonButton>
                )}

                {isEditMode && (
                  <CommonButton
                    variant="contained"
                    startIcon={<CommonIcon name="CircleCheck" />}
                    onClick={handleSaveUpdate}
                  >
                    Save Update
                  </CommonButton>
                )}
              </Box>
            </Box>
          )
        )}
      </Modal>
    </PageContainer>
  );
};

export default PatientTracker;
