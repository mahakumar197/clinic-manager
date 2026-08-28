import {
  Box,
  FormControl,
  InputAdornment,
  TextField,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { useMemo, useRef, useState } from "react";
import CommonIcon from "./CommonIcon";
import CommonIconButton from "./CommonIconButton";
import { DateRangeValue } from "@/types/dateRange";
import { DATE_FORMATS } from "@/constants";

/* ---------------- TYPES ---------------- */

interface CommonDateRangeProps {
  label?: boolean;
  placeholder?: boolean;
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  base?: boolean;
  primary?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  error?: boolean;
  disableFuture?: boolean;
  helperText?: string;
}

const DISPLAY_FORMAT = DATE_FORMATS.DATE;

/* ---------------- COMPONENT ---------------- */

const CommonDateRange = ({
  label,
  placeholder,
  value,
  onChange,
  base,
  primary,
  minDate,
  maxDate,
  disableFuture = false,
  error,
  helperText,
}: CommonDateRangeProps) => {
  const theme = useTheme();
  const HEIGHT = base ? "48px" : "40px";

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"start" | "end">("start");

  const anchorRef = useRef<HTMLDivElement | null>(null);

  const { startDate, endDate } = value;

  /* -------- DISPLAY VALUE -------- */
  const displayValue = useMemo(() => {
    if (startDate && endDate) {
      return `${startDate.format(DISPLAY_FORMAT)} ⇀ ${endDate.format(
        DISPLAY_FORMAT
      )}`;
    }
    if (startDate) {
      return `${startDate.format(DISPLAY_FORMAT)} ⇀`;
    }
    return "";
  }, [startDate, endDate]);

  /* -------- RANGE HELPERS -------- */
  const isInRange = (day: Dayjs) => {
    if (!startDate) return false;
    if (startDate && !endDate) {
      return day.isSame(startDate, "day");
    }
    return day.isAfter(startDate, "day") && day.isBefore(endDate!, "day");
  };

  /* -------- DATE SELECTION -------- */
  const handleSelect = (date: Dayjs | null) => {
    if (!date) return;

    // Start date
    if (step === "start") {
      onChange({ startDate: date, endDate: null });
      setStep("end");
      return;
    }

    // End date
    let start = startDate!;
    let end = date;

    // Auto-swap
    if (end.isBefore(start)) {
      [start, end] = [end, start];
    }

    onChange({ startDate: start, endDate: end });
    setStep("start");
    setOpen(false);
  };

  /* -------- OPEN HANDLER -------- */
  const handleOpen = () => {
    setOpen(true);
  };

  /* -------- CLOSE HANDLER (FIXED UX) -------- */
  const handleClose = () => {
    setOpen(false);

    //  Preserve start date if end not selected
    if (startDate && !endDate) {
      onChange({ startDate: null, endDate: null });
      setStep("start");
      return;
    }

    setStep("start");
  };

  const showClear = Boolean(startDate && endDate);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ startDate: null, endDate: null });
    setStep("start");
    setOpen(false);
  };

  const isVisuallyFocused = Boolean(open || displayValue);

  return (
    <FormControl fullWidth>
      {/* -------- INPUT (DateFilter UI) -------- */}

      <Box ref={anchorRef}>
        <TextField
          fullWidth
          label={label && "Start date ⇀ End date"}
          data-open={open}
          placeholder={placeholder && "Start date ⇀ End date"}
          value={displayValue}
          onClick={handleOpen}
          error={error}
          helperText={helperText}
          variant="filled"
          /*  KEEP LABEL AT TOP */
          data-focus={isVisuallyFocused}
          InputLabelProps={{
            shrink: isVisuallyFocused,
          }}
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/*  CLEAR ICON – only when full range */}
                  {showClear && (
                    <CommonIconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear(e);
                      }}
                      icon={
                        <CommonIcon
                          name="X"
                          size={14}
                          color={theme.palette.text.disabled}
                        />
                      }
                      sx={{
                        cursor: "pointer",
                        p: 0.25,
                        mt: 0.4,
                      }}
                    />
                  )}

                  {/*  CALENDAR ICON – always */}
                  <CommonIconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen();
                    }}
                    icon={
                      <CommonIcon
                        name="CalendarRange"
                        size={18}
                        color={theme.palette.text.disabled}
                      />
                    }
                    sx={{ cursor: "pointer", p: 0.25 }}
                  />
                </Box>
              </InputAdornment>
            ),
          }}
          sx={{
            /* ==== SAME STYLES AS DateFilter ==== */
            "& .MuiFilledInput-root": {
              height: HEIGHT,
              border: primary || base ? "1px solid" : "none",
              borderColor: primary
                ? theme.palette.primary.main
                : base
                ? theme.palette.secondary.contrastText
                : "transparent",
              backgroundColor: primary || base ? "transparent" : "#F2F2F2",
              borderRadius: "8px",
              overflow: "hidden",
              transition: "all 0.2s ease-in-out",
              fontSize: "14px",
            },

            /*  VISUAL FOCUS (open OR value exists) */
            '&[data-focus="true"] .MuiFilledInput-root': {
              borderColor: theme.palette.primary.main,
            },

            "& .MuiFilledInput-root.Mui-focused": {
              borderColor: "primary.main",
              backgroundColor: primary || base ? "transparent" : "#F2F2F2",
            },

            "& .MuiFilledInput-root:hover": {
              backgroundColor: primary || base ? "transparent" : "#F2F2F2",
            },

            "& .MuiFilledInput-root.Mui-error": {
              borderColor: "error.main",
            },

            "& .MuiInputLabel-root": {
              fontSize: "14px",
              display: label ? "block" : "none",
            },

            /*  label focus color */
            '&[data-focus="true"] .MuiInputLabel-root': {
              color: theme.palette.primary.main,
            },

            "& .MuiInputLabel-root.Mui-error": {
              color: "error.main",
            },

            "& .MuiFormHelperText-root": {
              marginLeft: "4px",
            },

            "& .MuiInputBase-input": {
              paddingTop: base ? "28px" : "10px",
              fontSize: "14px",
            },

            "& .MuiInputAdornment-root": {
              marginTop: 0.1,
            },

            "& .MuiSvgIcon-root": {
              fontSize: "18px",
              color: primary
                ? theme.palette.primary.main
                : theme.palette.text.disabled,
            },
          }}
        />
      </Box>

      {/* -------- REAL DATE PICKER -------- */}
      <DatePicker
        open={open}
        value={null}
        closeOnSelect={false}
        onChange={handleSelect}
        onClose={handleClose}
        minDate={minDate}
        disableFuture={disableFuture}
        maxDate={maxDate}
        format={DISPLAY_FORMAT}
        slotProps={{
          textField: { sx: { display: "none" } },
          // HIDE CANCEL / OK
          actionBar: {
            actions: [],
          },
          popper: {
            anchorEl: anchorRef.current,
            placement: "bottom-start",
            disablePortal: true,
            modifiers: [{ name: "flip", enabled: false }],
          },
          day: ({ day }) => ({
            sx: {
              borderRadius: "50%",

              // Start / End
              ...(startDate &&
                day.isSame(startDate, "day") && {
                  backgroundColor: theme.palette.primary.main,
                  color: "#fff",
                }),

              ...(endDate &&
                day.isSame(endDate, "day") && {
                  backgroundColor: theme.palette.primary.main,
                  color: "#fff",
                }),

              // In-between range
              ...(isInRange(day) && {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.main,
              }),
            },
          }),
        }}
      />
    </FormControl>
  );
};

export default CommonDateRange;
