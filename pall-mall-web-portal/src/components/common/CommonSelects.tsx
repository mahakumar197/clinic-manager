import React, { useState } from "react";
import {
  FormControl,
  TextField,
  useTheme,
  useMediaQuery,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import CommonIcon from "./CommonIcon";
import { SelectOption } from "@/types/select";

/* ===================== Types ===================== */

interface OptionType {
  label: string;
  value: string | number;
}

/* ===================== Simple dropdown Search + select (BaseSelect) ===================== */

interface BaseSelectProps {
  label?: string;
  placeholder?: string;
  name?: string;
  value: OptionType | null;
  options: OptionType[];
  onChange: (newValue: OptionType | null) => void;
  sx?: object;
  primary?: boolean;
  startIcon?: React.ReactNode;
  renderOption?: (props: any, option: OptionType) => React.ReactNode;
  noOptionsText?: string;
  disabled?: boolean; 
}

export const BaseSelect = ({
  label,
  placeholder,
  name,
  value,
  options,
  onChange,
  sx,
  primary,
  startIcon,
  renderOption,
  noOptionsText = "No options",
  disabled = false,
}: BaseSelectProps) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const handleChange = (_: any, value: SelectOption | null) => {
    onChange(value);
  };

  const safeOptions = options ?? [];

  return (
    <FormControl fullWidth>
      <Autocomplete
        disabled={disabled} 
        options={safeOptions}
        value={value}
        onChange={handleChange}
        clearOnEscape
        popupIcon={<KeyboardArrowDownOutlinedIcon />}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(a, b) => a?.value === b?.value}
        ListboxProps={{
          sx: {
            "& li": { fontSize: "14px" },
            "&:not(:hover) li.Mui-focused": {
              backgroundColor: "transparent",
            },
          },
        }}
        renderOption={renderOption}
        noOptionsText={noOptionsText}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            disabled={disabled}  
            label={label}
            placeholder={placeholder}
            variant="filled"
            onFocus={(e) => {
              e.target.select = () => {};
            }}
            InputProps={{
              ...params.InputProps,
              disableUnderline: true,
              startAdornment: startIcon && (
                <InputAdornment position="start">
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "-13px",
                      color: primary
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {startIcon}
                  </span>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiFilledInput-root": {
                height: "40px",
                border: primary ? "1px solid" : "none",
                borderColor: primary ? "primary.main" : "transparent",
                backgroundColor: primary ? "transparent" : "#F2F2F2",
                borderRadius: "8px",
                paddingLeft: "10px !important",
                overflow: "hidden",
                transition: "all 0.2s ease-in-out",
                paddingTop: 0,
              },

              "& .MuiFilledInput-root:hover": {
                backgroundColor: primary ? "transparent" : "#F2F2F2",
              },

              "& .MuiFilledInput-root.Mui-focused": {
                border: "1px solid",
                borderColor: "primary.main",
                backgroundColor: primary ? "transparent" : "#F2F2F2",
              },

              "& .MuiInputBase-input": {
                padding: "14px 10px",
                fontSize: "14px",

                "&::placeholder": {
                  color: primary
                    ? theme.palette.primary.main
                    : theme.palette.text.disabled,
                  opacity: 1,
                },
              },

              "& .MuiInputLabel-root": {
                display: "none",
                fontSize: "14px",
              },

              "& .MuiSvgIcon-root": {
                fontSize: "18px",
                color: primary
                  ? theme.palette.primary.main
                  : theme.palette.text.disabled,
              },

              ...sx,
            }}
          />
        )}
      />
    </FormControl>
  );
};

/* ===================== Form inputs with Floating label (CommonSelect) ===================== */

interface CommonSelectProps {
  label?: string;
  placeholder?: string;
  name?: string;
  value: OptionType | null;
  options: OptionType[];
  onChange: (newValue: OptionType | null) => void;
  onBlur?: () => void;
  startIcon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  sx?: object;
}

const CommonSelect = ({
  label,
  placeholder,
  name,
  value,
  options,
  onChange,
  onBlur,
  startIcon,
  error,
  helperText,
  disabled = false,
  required = false,
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
        onBlur={onBlur}
        disabled={disabled}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        ListboxProps={{
          sx: {
            "& li": { fontSize: "14px" },
            "&:not(:hover) li.Mui-focused": {
              backgroundColor: "transparent",
            },
          },

        }}
        renderInput={(params) => (
          <TextField
            required={required}
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

              "& .MuiInputBase-input": {
                paddingTop: "20px",
                paddingBottom: "6px",
                padding: "10px",
                paddingLeft: startIcon ? "0px" : "16px",
                paddingRight: "16px",
                marginLeft: "4px",
                fontSize: "14px",
                lineHeight: "1.5",
              },

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

export default BaseSelect;
export { CommonSelect };
