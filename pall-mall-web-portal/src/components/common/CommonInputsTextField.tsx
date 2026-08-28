import React, { useState } from "react";
import {
  TextField,
  useTheme,
  InputAdornment,
  TextFieldProps,
  Box,
} from "@mui/material";
import CommonIcon from "@/components/common/CommonIcon";

/*=========  For login page and  form we use the CommonTextField ======*/

type CommonTextFieldProps = TextFieldProps & {
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
}: CommonTextFieldProps) => {
  const theme = useTheme();
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
          // paddingRight: "12px",
          paddingLeft: "8px",
        },

        "& .MuiInputAdornment-positionStart": {
          marginTop: "0px !important",
          paddingLeft: "12px",
          paddingRight: "8px",
        },

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

        "& .MuiFilledInput-root.Mui-error": {
          borderColor: "error.main",
        },

        "& .Mui-disabled": {
          color: "text.disabled",
        },

        "& .MuiFilledInput-root.Mui-disabled": {
          backgroundColor: "transparent",
        },

        "& .MuiFilledInput-root, \
           & .MuiFilledInput-root:hover, \
           & .MuiFilledInput-root.Mui-focused, \
           & .MuiFilledInput-root.Mui-disabled": {
          backgroundColor: "transparent !important",
        },

        "& input::-ms-reveal": {
          display: "none",
        },

        "& input::-ms-clear": {
          display: "none",
        },

        ...sx,
      }}
    />
  );
};

/* ===================== For Filters or Search we use BaseTextField ===================== */
type BaseTextFieldProps = TextFieldProps & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  placeholder?: string;
};

const BaseTextField = ({
  startIcon,
  endIcon,
  placeholder = "Search...",
  sx,
  value,
  onChange,
  ...rest
}: BaseTextFieldProps) => {
  const hasValue = value !== undefined && value !== null && value !== "";

  const handleClear: React.MouseEventHandler<HTMLElement> = () => {
    onChange?.({
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <TextField
      {...rest}
      value={value}
      onChange={onChange}
      fullWidth
      size="small"
      placeholder={placeholder}
      variant="outlined"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" sx={{ marginTop: "2px" }}>
            {startIcon ?? <CommonIcon name="Search" />}
          </InputAdornment>
        ),
        endAdornment: (
          <>
            {hasValue && (
              <InputAdornment
                position="end"
                sx={
                  rest.multiline
                    ? { alignSelf: "flex-start", mt: "8px" }
                    : undefined
                }
              >
                <Box
                  onClick={handleClear}
                  sx={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    color: "text.secondary",
                    fontSize: 18,
                  }}
                >
                  <CommonIcon name="X" />
                </Box>
              </InputAdornment>
            )}
            {endIcon && (
              <InputAdornment position="end">{endIcon}</InputAdornment>
            )}
          </>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: "40px",
          borderRadius: "8px",
          backgroundColor: "#F2F2F2",
          transition: "border-color 0.2s ease",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "transparent",
        },
        "& .MuiInputBase-input": {
          fontSize: "14px",
        },
        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "transparent",
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
          {
            border: "1px solid",
            borderColor: "primary.main",
          },
        ...sx,
      }}
    />
  );
};

export default CommonTextField;
export { BaseTextField };
