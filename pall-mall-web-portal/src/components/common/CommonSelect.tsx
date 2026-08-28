import React, { useState } from "react";
import {
  FormControl,
  TextField,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import CommonIcon from "./CommonIcon";

interface OptionType {
  label: string;
  value: string | number;
}

interface CommonSelectProps {
  label?: string;
  placeholder?: string;
  name?: string;
  value: OptionType | null;
  options: OptionType[];
  onChange: (newValue: OptionType | null) => void;
  startIcon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  sx?: object;
}

const CommonSelect = ({
  label,
  placeholder,
  name,
  value,
  options,
  onChange,
  startIcon,
  error,
  helperText,
  disabled = false,
  sx,
}: CommonSelectProps) => {
  const [focused, setFocused] = useState(false);
  const hasValue = Boolean(value);

  return (
    <FormControl fullWidth>
      <Autocomplete
        options={options}
        value={value ?? null}
        onChange={(_, newValue) => onChange(newValue ?? null)}
        popupIcon={<CommonIcon name="ChevronDown" />}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(a, b) => a?.value === b?.value}
        disabled={disabled}
        ListboxProps={{
          sx: { "& li": { fontSize: "14px" } },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={label}
            placeholder={placeholder}
            variant="filled"
            fullWidth
            error={error}
            helperText={helperText}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            InputLabelProps={{
              shrink: focused || hasValue,
            }}
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
              ...(startIcon && {
                startAdornment: (
                  <InputAdornment position="start">{startIcon}</InputAdornment>
                ),
              }),
            }}
            sx={{
              /* ================= AUTOCOMPLETE NORMALIZATION ================= */

              "& .MuiAutocomplete-inputRoot": {
                display: "flex",
                alignItems: "center",
                paddingTop: "0px !important",
              },

              "& .MuiAutocomplete-input": {
                paddingTop: "20px !important",
                paddingBottom: "6px !important",
                paddingLeft: "0px !important",
                paddingRight: "0px !important",
                display: "flex",
                alignItems: "center",
              },

              /* ================= ROOT ================= */

              "& .MuiFilledInput-root": {
                height: "48px",
                border: "1px solid",
                borderColor: "secondary.contrastText",
                borderRadius: "8px",
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s ease-in-out",
                paddingTop: "8px",
                 paddingLeft: "12px !important",
              },

              "& .MuiFilledInput-root:hover": {
                backgroundColor: "transparent",
              },

              "& .MuiFilledInput-root.Mui-focused": {
                borderColor: "primary.main",
                backgroundColor: "transparent",
              },

              "& .MuiFilledInput-root.Mui-error": {
                borderColor: "error.main",
              },

              "& .MuiFilledInput-root.Mui-disabled": {
                backgroundColor: "transparent",
                color: "text.disabled",
              },

              /* ================= TEXT ================= */

              "& .MuiInputBase-input": {
                paddingTop: "20px",
                paddingBottom: "6px",
                padding:"10px",
                paddingLeft: startIcon ? "0px" : "16px",
                paddingRight: "16px",
                 marginLeft: "4px",
                fontSize: "14px",
                lineHeight: "1.5",
              },

              /* ================= ICON ================= */

              "& .MuiInputAdornment-root": {
                display: "flex",
                alignItems: "center",
                marginLeft: "1px",
                marginRight: "8px",
                color: "text.secondary",
              },

              "& .MuiInputAdornment-positionStart": {
                marginLeft: "10px",
                marginBottom: "19px",
              },

              /* ================= LABEL ================= */

              "& .MuiInputLabel-root": {
                transform: startIcon
                  ? "translate(48px, 14px) scale(1)"
                  : "translate(16px, 14px) scale(1)",
                fontSize: "14px",
              },

              "& .MuiInputLabel-shrink": {
                transform: startIcon
                  ? "translate(48px, 6px) scale(0.75)"
                  : "translate(16px, 6px) scale(0.75)",
              },

              /* ================= REMOVE FILLED UNDERLINE ================= */

              "& .MuiFilledInput-root::before, & .MuiFilledInput-root::after": {
                display: "none",
              },

              ...sx,
            }}
          />
        )}
      />
    </FormControl>
  );
};

export default CommonSelect;
