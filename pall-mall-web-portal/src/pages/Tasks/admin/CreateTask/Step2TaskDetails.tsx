import { Box, Typography, Paper, Avatar, useTheme } from "@mui/material";
import { Controller } from "react-hook-form";
import { CommonSelect, CommonTextField } from "@/components/common";
import { useTaskTemplates } from "@/hooks/useTaskTemplates";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { mapTaskTemplateToForm } from "@/utils/mapTaskTemplateToForm";
import CommonTextArea from "@/components/common/CommonTextArea";
import { useZohoForms } from "../../../../hooks/useZohoForms";
import { useContentTypes } from "@/hooks/useContentType";

interface Step2Props {
  form: any;
}



const Step2TaskDetails = ({ form }: Step2Props) => {
  const theme = useTheme();
  const { watch, setValue } = form;

  const patient = watch("patient");
  const selectedCategory = watch("category");
  // const isWatchContent = selectedCategory?.label === "Watch Content";
  const selectedCategoryLabel = selectedCategory?.label;

  const showZohoForm = selectedCategoryLabel === "Form Response";
  const showContentType = selectedCategoryLabel === "Watch Content";

  const { options: phaseOptions } = useDropdown(DropdownType.TASK_PHASE, false);
  const { options: categoryOptions } = useDropdown(
    DropdownType.TASK_CATEGORY,
    false
  );
  const { options: zohoOptions } = useDropdown(DropdownType.ZOHO_FORM, false);
  // const { options: contentTypeOptions } = useDropdown(
  //   DropdownType.TASK_CONTENT,
  //   false
  // );
  const { zohoForm, loading } = useZohoForms();
  const zohoFormOptions = zohoForm.map((d) => ({
    label: d.name,
    value: d.id,
  }));
  const { contentTypes, loading: contentTypesLoading } = useContentTypes();

  const contentTypeOptions = contentTypes.map((c) => ({
    label: c.title,
    value: c.id,
  }));

  const { templates } = useTaskTemplates();

  const templateOptions = templates.map((t, index) => ({
    label: t.template?.templateName || `Template ${index + 1}`, // temporary label
    value: t.id,
  }));

  const { unregister } = form;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Patient Summary */}
      {patient && (
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: "10px 14px",
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "primary.main",
            backgroundColor: "primary.light",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              fontSize: "14px",
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            {patient.userName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">{patient.userName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {patient.medicalData?.procedureType} -{" "}
              {patient.medicalData?.phase}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Quick Task Template */}
      <Controller
        name="template"
        control={form.control}
        render={({ field }) => (
          <CommonSelect
            label="Quick Task Template (Optional)"
            value={field.value}
            options={templateOptions}
            onChange={(option) => {
              field.onChange(option);

              const resetAllFields = () => {
                setValue("taskName", "");
                setValue("description", "");
                setValue("category", null);
                setValue("zohoForm", null);
                setValue("contentType", null);
              };

              if (!option) {
                resetAllFields();
                return;
              }

              const template = templates.find((t) => t.id === option.value);
              if (!template) return;
              resetAllFields();
              const mapped = mapTaskTemplateToForm(template.template, {
                phases: phaseOptions,
                categories: categoryOptions,
                zohoForms: zohoOptions,
                contentTypes: contentTypeOptions,
              });

              Object.entries(mapped).forEach(([key, value]) => {
                setValue(key, value ?? null, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              });
            }}
          />
        )}
      />

      {/* Task Name */}
      <Controller
        name="taskName"
        control={form.control}
        rules={{ required: "Task name is required" }}
        render={({ field, fieldState }) => (
          <CommonTextField
            label="Task Name *"
            {...field}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* Description */}
      {/* <Controller
        name="description"
        control={form.control}
        // rules={{ required: "Task description is required" }}
        render={({ field, fieldState }) => (
          <CommonTextField
            multiline
            autoHeight
            rows={3}
            label="Task Description"
            {...field}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      /> */}

      <Controller
        name="description"
        control={form.control}
        // rules={{ required: "Task description is required" }}
        render={({ field, fieldState}) => (
          <CommonTextArea placeholder="Task Description (Max 250 characters)" {...field}
           error={!!fieldState.error}            
           helperText={fieldState.error?.message} />
        )}
      />
      {/* Phase + Category */}
      <Box sx={{ display: "flex", gap: 2 }}>
        {/* <Controller
          name="phase"
          control={form.control}
          rules={{ required: "Phase is required" }}
          render={({ field, fieldState }) => (
            <CommonSelect
              label="Phase *"
              value={field.value}
              onChange={field.onChange}
              options={phaseOptions}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        /> */}

        <Controller
          name="category"
          control={form.control}
          rules={{ required: "Category is required" }}
          render={({ field, fieldState }) => (
            <CommonSelect
              label="Category *"
              value={field.value}
              onChange={(option) => {
                field.onChange(option);
                
                // Clear the opposite field when category changes
                // const isWatchContent = option?.label === "Watch Content";
                // if (isWatchContent) {
                //   setValue("zohoForm", null);
                //   form.clearErrors("zohoForm");
                // } else {
                //   setValue("contentType", null);
                //   form.clearErrors("contentType");
                // }

                const label = option?.label;

                if (label === "Form Response") {
                  setValue("contentType", null);
                  unregister("contentType");
                } else if (label === "Watch Content") {
                  setValue("zohoForm", null);
                  unregister("zohoForm");
                } else if (label === "E Signature" || label === "File Upload") {
                  setValue("zohoForm", null);
                  setValue("contentType", null);
                  unregister("zohoForm");
                  unregister("contentType");
                }
                form.clearErrors(["zohoForm", "contentType"]);
              }}
              options={categoryOptions}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>

      {/* Zoho / Content Type */}
      {/* <Box sx={{ display: !isWatchContent ? "block" : "none" }}>
        <Controller
          name="zohoForm"
          control={form.control}
          render={({ field, fieldState }) => (
            <CommonSelect
              label="Zoho Form *"
              value={field.value}
              onChange={field.onChange}
              options={zohoFormOptions}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>

      <Box sx={{ display: isWatchContent ? "block" : "none" }}>
        <Controller
          name="contentType"
          control={form.control}
          render={({ field, fieldState }) => (
            <CommonSelect
              label="Content Type *"
              value={field.value}
              onChange={field.onChange}
              options={contentTypeOptions}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box> */}

      {showZohoForm && (
        <Controller
          name="zohoForm"
          control={form.control}
          rules={{ required: "Zoho Form is required" }} 
          render={({ field, fieldState }) => (
            <CommonSelect
              label="Zoho Form *"
              value={field.value}
              onChange={field.onChange}
              options={zohoFormOptions}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}

      {showContentType && (
        <Controller
          name="contentType"
          control={form.control}
          rules={{ required: "Content Type is required" }}
          render={({ field, fieldState }) => (
            <CommonSelect
              label="Content Type *"
              value={field.value}
              onChange={field.onChange}
              options={contentTypeOptions}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}


    </Box>
  );
};

export default Step2TaskDetails;
