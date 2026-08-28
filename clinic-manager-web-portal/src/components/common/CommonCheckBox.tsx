import {
  FormControlLabel as MuiFormControlLabel,
  Checkbox as MuiCheckbox,
  SxProps,
  Theme,
  useTheme,
} from "@mui/material";
import React from "react";

export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  //   color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  bold?: boolean;
  labelFontSize?: string;
  height?: string | number;
  sx?: SxProps<Theme>;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
}

const CommonCheckbox = ({
  label,
  checked,
  disabled = false,
  //   color = "primary",
  bold = true,
  labelFontSize = "16px",
  height,
  sx,
  onChange,
}: CheckboxProps) => {
  const theme = useTheme();

  return (
    <MuiFormControlLabel
      disabled={disabled}
      label={label}
      control={
        <MuiCheckbox
          checked={checked}
          onChange={onChange}
          //   color={color}
          sx={{
            // checkbox border color (unchanged logic)
            color: theme.palette.divider,
            "&.Mui-checked": {
              //   color: theme.palette[color].main,
              color: theme.palette.primary.main,
            },
            "&.Mui-disabled": {
              color: theme.palette.action.disabled,
            },
          }}
        />
      }
      sx={{
        height,
        margin: !label ? 0 : undefined,

        "& .MuiFormControlLabel-label": {
          fontSize: labelFontSize,
          fontWeight: theme.typography.subtitle1.fontWeight,
          color: disabled
            ? theme.palette.text.disabled
            : theme.palette.text.primary,
        },

        ...sx,
      }}
    />
  );
};

export default CommonCheckbox;
