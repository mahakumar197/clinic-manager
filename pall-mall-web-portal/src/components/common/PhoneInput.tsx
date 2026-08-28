import { MuiTelInput } from "mui-tel-input";
import { SxProps } from "@mui/material";
import { CountryCode } from "libphonenumber-js";


interface Props {
  value: string;
  onChange: (value: string, info?: any) => void;
  label?: string;
  sx?: SxProps;
  defaultCountry?: CountryCode;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}


const CommonPhoneInput = ({
  value,
  onChange,
  label = "Phone Number",
  sx = {},
  defaultCountry = "GB",
  disabled = false,
  error,
  helperText,
}: Props) => {
  return (
    

<MuiTelInput
  value={value}
  onChange={onChange}
  defaultCountry={defaultCountry}
  label={label}
  variant="outlined"
  focusOnSelectCountry
  fullWidth
  disabled={disabled}
  error={error}
  helperText={helperText}
 sx={{
  "& .MuiInputAdornment-root.MuiInputAdornment-positionStart::after": {
    content: '""',
    width: "1px",
    height: "22px",
    backgroundColor: "#ddd",
    display: "inline-block",
    marginLeft: "8px",
    marginRight: "8px",
  },

  "& .MuiTelInput-FlagImg": {
    borderRadius: "50%",
    width: 22,
    height: 22,
    objectFit: "cover",
  },

  "& .MuiInputBase-root": {
    height: 52,
  },

  ...sx,
}}

MenuProps={{
    PaperProps: {
      sx: {
        maxHeight: 350,
        width: 330,
        mt: 1,
        borderRadius: 2,
        overflow: "auto",
      },
    },
  }}

/>



  );
};

export default CommonPhoneInput;
