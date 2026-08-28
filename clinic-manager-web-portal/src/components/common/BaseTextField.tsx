import { TextField, TextFieldProps, InputAdornment } from "@mui/material";
import CommonIcon from "@/components/common/CommonIcon";
import React from "react";

type Props = TextFieldProps & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  placeholder?: string;
};

const BaseTextField = ({
  startIcon,
  endIcon,
  placeholder = "Search...",
  sx,
  ...rest
}: Props) => {
  const { InputProps = {}, ...other } = rest;

  return (
    <TextField
      {...other}
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
        ...(endIcon && {
          endAdornment: (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ),
        }),
        ...InputProps,
      }}
      sx={{
        // placeholder color
        // "& .MuiInputBase-input::placeholder": {
        //   color: "secondary.contrastText",
        //   opacity: 1,
        //   fontSize: "14px",
        // },
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

export default BaseTextField;