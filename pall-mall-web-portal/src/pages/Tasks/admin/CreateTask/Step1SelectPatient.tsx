import { Box, Typography, Paper, Avatar, Chip, useTheme } from "@mui/material";
import { Controller } from "react-hook-form";
import { useState, useMemo } from "react";
import { CommonTextField, CommonIcon } from "@/components/common";
import { useUserList } from "@/hooks/useUserList";
// import CommonSkeleton from "@/components/common/CommonSkeleton";
import CommonSkeleton from "@/components/common/CommonSkeleton/index";

interface Step1SelectPatientProps {
  form: any; // RHF instance
}

const getInitials = (name: string = "") =>
  (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const Step1SelectPatient = ({ form }: Step1SelectPatientProps) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");

  //  Real API
  const { users, loading, isFetching } = useUserList({
    roleType: "PATIENT",
    search: search,
  });

  // Client-side search (fast + safe)
  const filteredPatients = useMemo(() => {
    if (!search) return users;

    const q = search.toLowerCase();
    return users.filter(
      (u) => u.userName?.toLowerCase().includes(q)
      // ||
      //   u.procedureType?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const sortedUsers = useMemo(() => {
  if (!form.getValues("patientId")) return filteredPatients;

  const selectedId = form.getValues("patientId");

  return [
    ...filteredPatients.filter((u) => u.id === selectedId),
    ...filteredPatients.filter((u) => u.id !== selectedId),
  ];
}, [filteredPatients, form.watch("patientId")]);


  return (
    <Box>
      {/* Search */}
      <CommonTextField
        fullWidth
        label="Search Patient"
        placeholder="Search by name or procedure..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Controller
        name="patientId"
        control={form.control}
        rules={{ required: "Please select a patient" }}
        render={({ field, fieldState }) => (
          <>
            {/* Loading */}
            {loading && (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <CommonSkeleton type="patientList" />
                ))}
              </>
            )}

            {/* Empty */}
            {!loading && users.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center">
                No patients found
              </Typography>
            )}
            {/* Validation error */}
            {fieldState.error && (
              <Typography
                variant="body2"
                sx={{ color: "error.main", mt: 0, ml: 0.5,mb: 2 }}
              >
                {fieldState.error.message}
              </Typography>
            )}
            {/* List */}
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mb: 2,
              opacity: isFetching ? 0.5 : 1,
              transition: "opacity 0.2s ease",
              pointerEvents: isFetching ? "none" : "auto",
            }}>
              {sortedUsers.map((patient) => {
                const isActive = field.value === patient.id;

                return (
                  <Paper
                    key={patient.id}
                    elevation={0}
                    onClick={() => {
                      form.setValue("patientId", patient.id, {
                        shouldValidate: true,
                      });
                      form.setValue("patient", patient);
                    }}
                    sx={{
                      // display: "flex",
                      // alignItems: "center",
                      //  gap: 2,
                      display: "flex",
                      alignItems: { xs: "flex-start", md: "center" },
                      gap: 2,
                      flexWrap: "wrap",
                      p: "10px 14px",

                      overflow: "hidden",
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: isActive ? "primary.main" : "divider",
                      backgroundColor: isActive
                        ? "primary.light"
                        : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: "14px",
                        bgcolor: isActive ? "primary.main" : "#FFF7E9",
                        color: isActive
                          ? "primary.contrastText"
                          : "primary.main",
                        display: {
                          xs: "none",
                          sm: "none",
                          md: "flex",
                        },
                      }}
                    >
                      {getInitials(patient.userName)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{
                        mb: 0.3,
                        whiteSpace: { xs: "normal", md: "nowrap" },
                        wordBreak: "break-word",
                      }}>
                        {patient.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        whiteSpace: { xs: "normal", md: "wrap" },
                        wordBreak: "break-word",
                      }}>
                        {patient?.medicalData?.procedureType || "Test"}
                      </Typography>
                    </Box>

                    <Chip
                      label={patient?.medicalData?.phase || "Test"}
                      size="small"
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: "divider",
                        fontSize: "12px",
                        height: "22px",
                        flexShrink: 0,
                        maxWidth: { xs: 90, md: "none" },
                        bgcolor: "transparent",
                        mt: { xs: 0.5, md: 0 },
                        alignSelf: { xs: "flex-start", md: "center" },
                      }}
                    />

                    {isActive && (
                      <CommonIcon
                        name="CircleCheckBig"
                        size={20}
                        color={theme.palette.primary.main}
                      />
                    )}
                  </Paper>
                );
              })}
            </Box>
          </>
        )}
      />
    </Box>
  );
};

export default Step1SelectPatient;
