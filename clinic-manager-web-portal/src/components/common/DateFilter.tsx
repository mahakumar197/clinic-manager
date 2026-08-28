import {
  FormControl,
  Box,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { Dayjs } from "dayjs";
import { ClearIcon } from "@mui/x-date-pickers";
import { DATE_FORMATS } from "@/constants";
import { useState } from "react";

interface DateFilterProps {
  label?: string;
  placeholder?: string;
  value?: Dayjs | null;
  onChange?: (newValue: Dayjs | null) => void;
  sx?: object;
  primary?: boolean;
  disablePast?:boolean;
  base?: boolean;
  error?: boolean;
  helperText?: string;
}

const DateFilter = ({
  label,
  placeholder,
  value,
  onChange,
  sx,
  primary,
  base,
  disablePast=false,
  error,
  helperText,
}: DateFilterProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const HEIGHT = base ? "48px" : "40px";
  const [open, setOpen] = useState(false);
  const isEmpty = !value;

  return (
    <FormControl fullWidth sx={{ position: "relative" }}>
      <DatePicker
        value={value}
        // onChange={onChange}
        onChange={(newValue) => {
          onChange?.(newValue);
          setOpen(false);
        }}
        disablePast={disablePast}
        format={DATE_FORMATS.DATE}
        open={open}
        onClose={() => setOpen(false)}
        slots={{
          openPickerIcon: CalendarTodayOutlinedIcon,
        }}
        slotProps={{
          openPickerIcon: {
            onClick: () => setOpen(true),
          },
          textField: {
            variant: "filled",
            placeholder,
            label,
            fullWidth: true,
            error,
            helperText,
            onClick: () => setOpen(true),
            inputProps: {  
              placeholder: placeholder,
            },
            InputProps: {
              disableUnderline: true,
              endAdornment: value ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // do not open calendar
                      onChange?.(null);
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
            sx: {
              "& .MuiPickersFilledInput-root": {
                // "& .MuiFilledInput-root": {
                height: HEIGHT,
                border: primary || base ? "1px solid" : "none",
                borderColor: primary
                  ? "primary.main"
                  : base
                  ? "secondary.contrastText"
                  : "transparent",
                backgroundColor: primary || base ? "transparent" : "#F2F2F2",
                borderRadius: "8px",
                // paddingLeft: "6px !important",
                overflow: "hidden",
                transition: "all 0.2s ease-in-out",
                fontSize: "14px",
              },

              "& .MuiPickersFilledInput-root.Mui-focused": {
                borderColor: "primary.main",
                backgroundColor: primary || base ? "transparent" : "#F2F2F2",
              },
              "& .MuiPickersFilledInput-root:hover": {
                backgroundColor: primary || base ? "transparent" : "#F2F2F2",
              },

              "& .MuiPickersFilledInput-root.Mui-error": {
                borderColor: "error.main",
              },
              "& .MuiInputLabel-root.Mui-error": {
                color: "error.main",
              },
              "& .MuiFormHelperText-root": {
                marginLeft: "4px",
              },

              "& .MuiPickersSectionList-root": {
                // "& .MuiInputBase-input": {
                paddingTop: base ? "28px" : "10px",
                fontSize: "14px",
                "&::placeholder": {
                  color: primary
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                  opacity: 1,
                },
              },

              // Hide format segments when empty
              ...(isEmpty && {
                "& .MuiPickersSectionList-section": {
                  visibility: "hidden",
                },
              }),

              // label
              "& .MuiInputLabel-root": {
                fontSize: "14px",
                display: label ? "block" : "none",
              },

              // the calendar icon at the end
              "& .MuiIconButton-root": {
                paddingRight: "8px",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "18px",
                color: primary
                  ? theme.palette.primary.main
                  : theme.palette.text.disabled,
              },

              ...sx,
            },
          },
        }}
      />
      {/* Placeholder overlay when no date is selected */}
      {isEmpty && placeholder && (
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: "absolute",
            top: 0,
            left: 12,
            height: HEIGHT,
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            color: primary
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {placeholder}
        </Box>
      )}
    </FormControl>
  );
};

export default DateFilter;
