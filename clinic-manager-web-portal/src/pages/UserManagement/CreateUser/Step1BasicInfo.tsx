import { Box } from "@mui/material";
import { Controller } from "react-hook-form";
import {
  CommonTextField,
  CommonSelect,
  CommonPhoneInput,
} from "@/components/common";
import { DropdownType } from "@/services";
import { useDropdown } from "@/hooks/useDropdown";

const Step1BasicInfo = ({ form }) => {
  const { options: roleOptions } = useDropdown(DropdownType.USER_ROLE, false);
  const { options: departmentOptions } = useDropdown(
    DropdownType.USER_DEPARTMENT,
    false,
  );
  const { trigger } = form;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* First + Last Name */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Controller
          name="firstName"
          control={form.control}
          render={({ field, fieldState }) => (
            <CommonTextField
              {...field}
              label="First Name *"
              placeholder="Enter first name"
              value={field.value || ""} // prevent undefined
              onChange={(e) => {
                field.onChange(e.target.value);
                trigger("firstName");
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="lastName"
          control={form.control}
          render={({ field, fieldState }) => (
            <CommonTextField
              {...field}
              label="Last Name *"
              placeholder="Enter last name"
              value={field.value || ""} // prevent undefined
              onChange={(e) => {
                field.onChange(e.target.value);
                trigger("lastName");
              }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>

      {/* Email */}
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <CommonTextField
            {...field}
            label="Email Address *"
            placeholder="user@mail.co.uk"
            value={field.value || ""} // prevent undefined
            onChange={(e) => {
              field.onChange(e.target.value.toLowerCase());
              if (fieldState.error) {
                trigger("email");
              }
            }}
            // onChange={(e) => field.onChange(e.target.value.toLowerCase())}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* Phone Number */}
      <Controller
        name="phoneNumber"
        control={form.control}
        render={({ field: phoneField, fieldState: phoneFieldState }) => (
          <Controller
            name="phoneCountryCode"
            control={form.control}
            render={({ field: countryField }) => (
              <CommonPhoneInput
                value={phoneField.value || ""}
                onChange={(value, info) => {
                  // Set the full phone number with country code
                  phoneField.onChange(value);
                  phoneField.onBlur();
                  // Extract and set country code (e.g., "+91")
                  if (info?.countryCallingCode) {
                    countryField.onChange(`+${info.countryCallingCode}`);
                  }
                }}
                label="Phone Number *"
                error={!!phoneFieldState.error}
                helperText={phoneFieldState.error?.message}
              />
            )}
          />
        )}
      />

      {/* Department */}
      <Controller
        name="department"
        control={form.control}
        rules={{ required: "Department is required" }}
        render={({ field, fieldState }) => (
          <CommonSelect
            label="Department"
            required
            value={field.value}
            // onChange={field.onChange}
            onChange={(val) => {
              field.onChange(val);

              trigger("department");
            }}
            options={departmentOptions}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* Role */}
      <Controller
        name="role"
        control={form.control}
        rules={{ required: "Role is required" }}
        render={({ field, fieldState }) => (
          <CommonSelect
            label="Role"
            required
            value={field.value}
            // onChange={field.onChange}
            onChange={(val) => {
              field.onChange(val);
              trigger("role");
            }}
            options={roleOptions}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </Box>
  );
};

export default Step1BasicInfo;
