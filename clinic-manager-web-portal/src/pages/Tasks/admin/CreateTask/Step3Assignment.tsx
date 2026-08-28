import {
  Box,
  Typography,
  Paper,
  Avatar,
  Divider,
  useTheme,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { CommonSelect, DateFilter } from "@/components/common";
import { useUserList } from "@/hooks/useUserList";
import { useMemo } from "react";
import { capitalize } from "@/utils";


interface Step3Props {
  form: any; // RHF instance
}

const Step3Assignment = ({ form }: Step3Props) => {
  const theme = useTheme();
  const { watch } = form;

  const patient = watch("patient");
  const phase = watch("phase");

  // 🔹 Fetch doctors
  const { users, loading } = useUserList({ exclude: "ADMIN,PATIENT" });
  

    const doctorOptions = useMemo(() =>
    users
      .filter((d) => d && d.id && d.userName)
      .map((d) => ({
       label: d.role ? `${capitalize(d.userName)} (${capitalize(d.role)})` : capitalize(d.userName),
        value: d.id,
      })),
    [users]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Patient Summary */}
      {patient && (
        <Paper
          elevation={0}
          sx={{
            p: "14px 16px",
            borderRadius: "12px",
            border: `1px solid ${theme.palette.primary.main}`,
            backgroundColor: theme.palette.primary.light,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                fontSize: "14px",
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              {patient.userName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="body1">{patient.userName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {patient.medicalData?.procedureType} -{" "}
                {patient.medicalData?.phase}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Assign To */}
      <Controller
        name="assignee"
        control={form.control}
        rules={{ required: "Assignee is required" }}
        render={({ field, fieldState }) => (
          <CommonSelect
            label="Assigned Staff *"
            value={field.value}
            onChange={field.onChange}
            options={doctorOptions}
            // loading={loading}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* Due Date */}
      <Controller
        name="dueDate"
        control={form.control}
        rules={{ required: "Due Date is required" }}
        render={({ field, fieldState }) => (
          <DateFilter
            base
            label="Due Date *"
            value={field.value}
            onChange={field.onChange}
            disablePast
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            sx={{
              "& .MuiFormHelperText-root": {
                marginLeft: 1.5,
              },
            }}
          />
        )}
      />
    </Box>
  );
};

export default Step3Assignment;
