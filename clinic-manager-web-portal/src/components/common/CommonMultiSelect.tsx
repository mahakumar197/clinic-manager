import { useState } from "react";
import {
  Autocomplete,
  TextField,
  FormControl,
  InputAdornment,
  Chip,
} from "@mui/material";

interface OptionType {
  label: string;
  value: string | number;
}

interface CommonMultiSelectProps {
  label?: string;
  placeholder?: string;
  name?: string;
  value: OptionType[];
  options: OptionType[];
  onChange: (newValue: OptionType[]) => void;
  startIcon?: React.ReactNode;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  disableClearable?: boolean;
  filterSelectedOptions?: boolean;
  sx?: object;
}

const CommonMultiSelect = ({
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
  filterSelectedOptions = false,
  sx,
}: CommonMultiSelectProps) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <FormControl fullWidth>
      <Autocomplete
        multiple
        options={options}
        disableClearable
        value={value}
        onChange={(_, newValue, reason, details) => {
          // Handle "All" option logic
          if (reason === "selectOption" && details?.option) {
            const selectedOption = details.option;

            // If "All" is clicked
            if (selectedOption.value === "all") {
              // Set only "All", remove all other selections
              onChange([selectedOption]);
              return;
            }

            // If any other option is clicked and "All" is currently selected
            const hasAll = value.some((item) => item.value === "all");
            if (hasAll) {
              // Remove "All" and add the new selection
              const withoutAll = newValue.filter(
                (item) => item.value !== "all"
              );
              onChange(withoutAll);
              return;
            }
          }

          // For remove actions or normal selections without "All"
          onChange(newValue);
        }}
        disableCloseOnSelect
        popupIcon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(a, b) => a?.value === b?.value}
        disabled={disabled}
        filterSelectedOptions={filterSelectedOptions}
        ListboxProps={{
          sx: { "& li": { fontSize: "14px" } },
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={option.label}
                size="small"
                {...tagProps}
                sx={{
                  height: "26px",
                  fontSize: "13px",
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                  borderRadius: "6px",
                  "& .MuiChip-label": {
                    paddingLeft: "10px",
                    paddingRight: "10px",
                  },
                  "& .MuiChip-deleteIcon": {
                    fontSize: "18px",
                    color: "rgba(0, 0, 0, 0.6)",
                    marginRight: "4px",
                    "&:hover": {
                      color: "rgba(0, 0, 0, 0.8)",
                    },
                  },
                }}
              />
            );
          })
        }
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
              sx: {
                transition: "none !important",
              },
            }}
            inputProps={{
              ...params.inputProps,
              readOnly: true,
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
                alignItems: "flex-start",
                paddingTop: hasValue ? "8px !important" : "0px !important",
                paddingBottom: "8px !important",
                flexWrap: "wrap",
                gap: "6px",
              },

              "& .MuiAutocomplete-input": {
                paddingTop: hasValue ? "0px !important" : "10px !important",
                paddingBottom: hasValue ? "0px !important" : "0px !important",
                paddingLeft: "0px !important",
                paddingRight: "0px !important",
                minWidth: hasValue ? "0px !important" : "120px !important",
                width: hasValue ? "0px !important" : "auto",
                flex: hasValue ? "0" : "1",
                display: hasValue ? "none !important" : "block",
              },

              "& .MuiAutocomplete-tag": {
                margin: "0px",
              },

              "& .MuiFilledInput-root": {
                minHeight: "48px",
                height: "auto",
                border: "1px solid",
                borderColor: "secondary.contrastText",
                borderRadius: "8px",
                backgroundColor: "transparent",
                display: "flex",
                alignItems: hasValue ? "flex-start" : "center",
                transition: "none",
                paddingTop: hasValue ? "18px !important" : "8px",
                paddingBottom: "8px",
                paddingLeft: "12px !important",
                paddingRight: "12px !important",
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
                pointerEvents: "none",
                transition: "none",
              },

              "& .MuiInputLabel-shrink": {
                transform: startIcon
                  ? "translate(48px, 4px) scale(0.75)"
                  : "translate(16px, 4px) scale(0.75)",
                transition: "none",
              },

              "& .MuiFilledInput-root::before, & .MuiFilledInput-root::after": {
                display: "none",
              },

              "& .MuiAutocomplete-popupIndicator": {
                color: "text.secondary",
                marginRight: "8px",
              },

              "& .MuiAutocomplete-endAdornment": {
                top: "50%",
                transform: "translateY(-50%)",
              },

              ...sx,
            }}
          />
        )}
      />
    </FormControl>
  );
};

export default CommonMultiSelect;
