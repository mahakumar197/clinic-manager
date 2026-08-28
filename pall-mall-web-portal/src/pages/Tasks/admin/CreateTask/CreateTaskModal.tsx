import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useMemo } from "react";
import dayjs from "dayjs";
import { Stepper, BaseModal } from "@/components/common";
import Step1SelectPatient from "./Step1SelectPatient";
import Step2TaskDetails from "./Step2TaskDetails";
import Step3Assignment from "./Step3Assignment";
import { CreateTaskSchema } from "./Schemas";
import { useStepController } from "@/hooks";
import { useCreateTask } from "@/services/modules/useCreateTask";
import { tasksService } from "@/services/modules/tasks.service";
import { toast } from "@/utils/toast";
import { useDropdown } from "@/hooks/useDropdown";
import { DropdownType } from "@/services";
import { useUserList } from "@/hooks/useUserList";
import { useZohoForms } from "@/hooks/useZohoForms";
import { useContentTypes } from "@/hooks/useContentType";

const steps = ["Select Patient", "Task Details", "Assignment"];

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  taskDetails?: any;
}

const findOption = (options: any[] = [], value?: string | number | null) => {
  if (!value) return null;
  return options.find((o) => String(o.value) === String(value)) ?? null;
};

const CreateTaskModal = ({
  open,
  onClose,
  onSuccess,
  mode = "create",
  taskDetails,
}: CreateTaskModalProps) => {
  const hasPrefilledRef = useRef(false);
  const form = useForm({
    resolver: zodResolver(CreateTaskSchema),
    mode: "onChange",
    defaultValues: {
      patientId: null,
      template: null,
      taskName: "",
      description: "",
      // phase: null,
      category: null,
      zohoForm: null,
      contentType: null,
      assignee: null,
      dueDate: null,
    },
  });

  const { trigger, handleSubmit, reset } = form;
  const { createTask, loading } = useCreateTask();

  /* ----------------------------
   * USERS → ASSIGNEE OPTIONS
   * ---------------------------- */
  const { users } = useUserList({ roleType: "DOCTOR" });

  const doctorOptions = useMemo(
    () =>
      users.map((d) => ({
        label: d.userName,
        value: d.id,
      })),
    [users],
  );

  const { zohoForm } = useZohoForms();
  const zohoFormOptions = zohoForm.map((d) => ({
    label: d.name,
    value: d.id,
  }));

  const { contentTypes } = useContentTypes();
  const contentTypeOptions = contentTypes.map((c) => ({
    label: c.title,
    value: c.id,
  }));

  /* ----------------------------
   * DROPDOWNS
   * ---------------------------- */
  const { options: phaseOptions } = useDropdown(DropdownType.TASK_PHASE, false);
  const { options: categoryOptions } = useDropdown(
    DropdownType.TASK_CATEGORY,
    false,
  );

  /* ----------------------------
   * STEP VALIDATION
   * ---------------------------- */
  const validateStep = async (stepIndex: number) => {
    if (stepIndex === 0) {
      return await trigger(["patientId"]);
    }

    if (stepIndex === 1) {
      // First trigger basic field validation
      const isValid = await trigger([
        "taskName",
        "description",
        "category",
      ]);

      if (!isValid) return false;

      // Manual conditional validation for zohoForm/contentType
      // const category = form.getValues("category");
      // const isWatchContent = category?.label === "Watch Content";

      // if (isWatchContent) {
      //   const contentType = form.getValues("contentType");
      //   if (!contentType) {
      //     form.setError("contentType", {
      //       type: "manual",
      //       message: "Content type is required",
      //     });
      //     return false;
      //   }
      // } else {
      //   const zohoForm = form.getValues("zohoForm");
      //   if (!zohoForm) {
      //     form.setError("zohoForm", {
      //       type: "manual",
      //       message: "Zoho form is required",
      //     });
      //     return false;
      //   }
      // }

      const category = form.getValues("category")?.label;

      if (category === "Watch Content") {
        const contentType = form.getValues("contentType");
        if (!contentType) {
          form.setError("contentType", { type: "manual", message: "Content type is required" });
          return false;
        }
      } else if (category === "Form Response") {
        const zohoForm = form.getValues("zohoForm");
        if (!zohoForm) {
          form.setError("zohoForm", { type: "manual", message: "Zoho form is required" });
          return false;
        }
      }
      return true;
    }

    if (stepIndex === 2) {
      return await trigger(["assignee", "dueDate"]);
    }

    return true;
  };

  const { step, nextStep, prevStep, resetStep, isLastStep } = useStepController(
    {
      totalSteps: steps.length,
      validateStep,
    },
  );

  /* ----------------------------
   * EDIT MODE PREFILL (SAFE)
   * ---------------------------- */
  useEffect(() => {
    if (
      mode !== "edit" ||
      !taskDetails ||
      hasPrefilledRef.current ||
      !phaseOptions.length ||
      !categoryOptions.length
    ) {
      return;
    }

    reset({
      patientId: taskDetails.patient?.id ?? null,
      taskName: taskDetails.task_name,
      description: taskDetails.task_description,

      category: findOption(categoryOptions, taskDetails.category_id),
      zohoForm: findOption(zohoFormOptions, taskDetails.zoho_form),
      contentType: findOption(contentTypeOptions, taskDetails.content_id),
      assignee: findOption(doctorOptions, taskDetails.assigned_to),
      dueDate: dayjs(taskDetails.due_date),
    });

    hasPrefilledRef.current = true;
  }, [
    mode,
    taskDetails,
    reset,
    phaseOptions,
    categoryOptions,
    zohoFormOptions,
    contentTypeOptions,
    doctorOptions,
  ]);

  /* ----------------------------
   * FINAL SUBMIT
   * ---------------------------- */
  const onSubmit = async (data: any) => {
    const isWatchContent = data.category?.label === "Watch Content";

    const payload = {
      patientId: data.patientId,
      procedureType: data?.patient?.medicalData?.procedureTypeId || taskDetails?.procedure_type_id,
      taskName: data.taskName,
      taskDescription: data.description,
      phase: data?.patient?.medicalData?.phaseId || taskDetails?.phase_id,
      category: Number(data.category?.value),
      zohoform: !isWatchContent ? data.zohoForm?.value : undefined,
      assignedTo: data.assignee?.value,
      dueDate: dayjs(data.dueDate).format("YYYY-MM-DD"),

      ...(data.template?.value && {
        taskTemplate: data.template.value,
      }),

      ...(isWatchContent &&
        data.contentType?.value && {
        contentId: data.contentType.value,
      }),
    };

    try {
      if (mode === "edit" && taskDetails?.id) {
        await tasksService.updateTask(taskDetails.id, payload);
        toast.success("Task updated successfully");
      } else {
        await createTask(payload);
        toast.success("Task created successfully");
      }

      onSuccess?.();
      onClose();
      reset();
      resetStep();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  /* ----------------------------
   * RESET ON CLOSE
   * ---------------------------- */
  useEffect(() => {
    if (!open) {
      reset();
      resetStep();
      hasPrefilledRef.current = false; // 🔑 important
    }
  }, [open]);

  const renderStepContent = () => {
    if (step === 0) return <Step1SelectPatient form={form} />;
    if (step === 1) return <Step2TaskDetails form={form} />;
    if (step === 2) return <Step3Assignment form={form} />;
    return null;
  };

  const subtitle = `Step ${step + 1} of ${steps.length}: ${steps[step]}`;

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit Task" : "Create New Task"}
      subtitle={subtitle}
      onBack={step === 0 ? onClose : prevStep}
      onNext={isLastStep ? handleSubmit(onSubmit) : nextStep}
      backLabel={step === 0 ? "Cancel" : "Back"}
      nextLabel={isLastStep ? "Save Task" : "Continue"}
      loading={loading}
      headerContent={<Stepper steps={steps} activeStep={step} variant="line" />}
    >
      <Box mt={1}>{renderStepContent()}</Box>
    </BaseModal>
  );
};

export default CreateTaskModal;
