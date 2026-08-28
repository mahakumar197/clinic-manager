import {
  FormControl,
  TextField,
  useTheme,
  useMediaQuery,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import { SelectOption } from "@/types/select";

interface OptionType {
  label: string;
  value: string | number;
}

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
}

const BaseSelect = ({
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
        options={safeOptions}
        value={value}
        onChange={handleChange}
        clearOnEscape
        popupIcon={<KeyboardArrowDownOutlinedIcon />}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(a, b) => a?.value === b?.value}
        ListboxProps={{
          sx: { "& li": { fontSize: "14px" } },
        }}
        renderOption={renderOption}
        noOptionsText={noOptionsText}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            label={label}
            placeholder={placeholder}
            variant="filled"
            onFocus={(e) => {
              e.target.select = () => {}; // stops auto selecting the whole value
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

export default BaseSelect;
