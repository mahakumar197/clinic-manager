import React, { useState } from "react";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

type CommonTextAreaProps = {
  minRows?: number;
  maxRows?: number;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;

  error?: boolean;
  helperText?: string;
};

const CommonTextArea = ({
  minRows = 5,
  maxRows,
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
}: CommonTextAreaProps) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <>
      <Box
        sx={{
          border: "1px solid",
          borderColor:error
          ? "error.main":
           focused
            ? "primary.main"
            : disabled
              ? theme.palette.text.disabled
              : theme.palette.secondary.contrastText,
          borderRadius: "8px",
          transition: "border-color 0.2s ease",
          padding: "15px 13px 6px 14px",

          "& textarea::placeholder": {
            color: theme.palette.text.secondary,
            opacity: 1,
            fontSize: "14px",
            fontWeight: 500,
          },
        }}
      >
        <TextareaAutosize
          minRows={minRows}
          maxRows={maxRows}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            resize: "vertical",
            fontSize: "14px",
            fontWeight: 400,
            fontFamily: theme.typography.fontFamily,
            color: disabled
              ? theme.palette.text.disabled
              : theme.palette.text.primary,
            background: "transparent",
          }}
        />
      </Box>
      {error && helperText && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: "4px", ml: "4px" }}
        >
          {helperText}
        </Typography>
      )}
    </>
  );
};

export default CommonTextArea;
