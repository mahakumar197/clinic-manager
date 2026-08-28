import React, { useState } from "react";
import {
  InputAdornment,
  TextField,
  TextFieldProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";

type Props = TextFieldProps & {
  auth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  autoHeight?: boolean;
};

const CommonTextField = ({
  auth = false,
  sx,
  startIcon,
  endIcon,
  autoHeight,
  InputProps,
  value,
  ...rest
}: Props) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const HEIGHT = auth ? "54px" : autoHeight ? "auto" : "48px";

  const [focused, setFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <TextField
      {...rest}
      value={value}
      variant="filled"
      fullWidth
      onFocus={(e) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
      InputLabelProps={{
        shrink: focused || hasValue,
        ...rest.InputLabelProps,
      }}
      InputProps={{
        disableUnderline: true,
        ...(startIcon && {
          startAdornment: (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ),
        }),
        ...(endIcon && {
          endAdornment: (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ),
        }),
        ...InputProps,
      }}
      sx={{
        /* ================= INPUT ROOT ================= */

        "& .MuiFilledInput-root": {
          height: autoHeight ? "auto" : HEIGHT,
          backgroundColor: "transparent",
          border: "1px solid",
          borderColor: "secondary.contrastText",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          transition: "all 0.2s ease-in-out",
          overflow: "hidden", 
        },

        "& .MuiFilledInput-root:hover": {
          backgroundColor: "transparent",
        },

        "& .MuiFilledInput-root.Mui-focused": {
          backgroundColor: "transparent",
          borderColor: "primary.main",
        },

        /* ================= INPUT TEXT ================= */

        "& .MuiInputBase-input": {
          paddingTop: "20px",
          paddingBottom: "6px",
          paddingLeft: startIcon ? "0px" : "16px",
          paddingRight: "16px",
          fontSize: auth ? "inherit" : "14px",
        },

        "& .MuiFilledInput-root .MuiInputBase-input": {
          height: "100%",
          boxSizing: "border-box",
        },

        /* ================= ICON ================= */

        "& .MuiInputAdornment-root": {
          position: "relative",
          alignSelf: "center",
          marginTop: "0px !important",
          marginBottom: "0px !important",
          marginLeft: "-4px",
          marginRight: "8px",
          color: "text.secondary",
          height: "100%",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        },

        "& .MuiInputAdornment-positionEnd": {
          paddingRight: "12px",
          paddingLeft: "8px",
        },

        "& .MuiInputAdornment-positionStart": {
          marginTop: "0px !important",
          paddingLeft: "12px",
          paddingRight: "8px",
        },

        /* ================= LABEL ================= */

        "& .MuiInputLabel-root": {
          transform: startIcon
            ? "translate(48px, 14px) scale(1)"
            : "translate(16px, 14px) scale(1)",
          fontSize: auth ? "inherit" : "14px",
          transition:
            "color 200ms cubic-bezier(0.0, 0, 0.2, 1), transform 200ms cubic-bezier(0.0, 0, 0.2, 1)",
        },

        "& .MuiInputLabel-shrink": {
          transform: startIcon
            ? "translate(48px, 6px) scale(0.75)"
            : "translate(16px, 6px) scale(0.75)",
        },

        /* ================= STATES ================= */

        "& .MuiFilledInput-root.Mui-error": {
          borderColor: "error.main",
        },

        "& .Mui-disabled": {
          color: "text.disabled",
        },

        "& .MuiFilledInput-root.Mui-disabled": {
          backgroundColor: "transparent",
        },

        /* FORCE TRANSPARENT IN ALL STATES */
        "& .MuiFilledInput-root, \
           & .MuiFilledInput-root:hover, \
           & .MuiFilledInput-root.Mui-focused, \
           & .MuiFilledInput-root.Mui-disabled": {
          backgroundColor: "transparent !important",
        },

        ...sx,
      }}
    />
  );
};

export default CommonTextField;
