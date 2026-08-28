import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { useStepController } from "@/hooks/useStepController";

import Step1BasicInfo from "./Step1BasicInfo";
import Step2Password from "./Step2Password";
import Step3Review from "./Step3Review";

import { FinalUserSchema } from "./Schemas";
import { Stepper, BaseModal } from "@/components/common";
import { useCreateUser } from "../hooks/useCreateUser";
import { CreateUserPayload } from "@/services";
import { formatPhoneNumberWithCountryCode } from "@/utils/helpers";

const steps = ["Basic Info", "Password", "Review"];

const CreateUserModal = ({ open, onClose, onSuccess }) => {
  const { createUser, creating } = useCreateUser();
  
  const form = useForm({
    resolver: zodResolver(FinalUserSchema),
    mode: "onBlur",
    defaultValues: {
      // Step 1
      firstName: "",
      lastName: "",
      email: "",
      phoneCountryCode: "",
      phoneNumber: "",
      department: null,
      role: null,

      // Step 2
      password: "",
      confirmPassword: "",
      twoFactor: false,

      // Step 3
      sendWelcomeEmail: true,
      additionalNotes: "",
    },
  });

  const { trigger, handleSubmit, reset } = form;
  const { step, nextStep, prevStep, resetStep, isLastStep } = useStepController(
    {
      totalSteps: steps.length,
      validateStep: async (idx) => {
        // STEP 1 → validate individual fields
        if (idx === 0) {
          return await trigger([
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "department",
            "role",
          ]);
        }

        // STEP 2 → Trigger only these two to activate refine()
        if (idx === 1) {
          return await trigger(["password", "confirmPassword"], {
            shouldFocus: true,
          });
        }

        return true; // Step 3 has no required fields
      },
    }
  );

  // Reset form + reset stepper when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      resetStep();
    }
  }, [open]);

  // SUBMIT FINAL DATA
  const onSubmit = async (data) => {
    try {
      // Format phone number: country code + space + number (e.g., "+44 7986588525")
      const formattedPhoneNumber = formatPhoneNumberWithCountryCode(
        data.phoneNumber,
        data.phoneCountryCode
      );

      const payload: CreateUserPayload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role?.value,
        department: data.department?.value,
        password: data.password,
        twoFaEnabled: data.twoFactor || false,
        sendWelcomeEmail: data.sendWelcomeEmail || false,
        phoneNumber: formattedPhoneNumber,
        additionalNotes: data.additionalNotes || undefined,
      };

      await createUser(payload);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  // Render steps
  const renderStep = () => {
    if (step === 0) return <Step1BasicInfo form={form} />;
    if (step === 1) return <Step2Password form={form} />;
    if (step === 2) return <Step3Review form={form} />;
    return null;
  };

  const subtitle = `Step ${step + 1} of ${steps.length}: ${steps[step]}`;

  return (
    <BaseModal
      open={open}
      onClose={creating ? undefined : onClose}
      title="Add New User"
      subtitle={subtitle}
      onBack={step === 0 ? onClose : prevStep}
      onNext={isLastStep ? handleSubmit(onSubmit) : nextStep}
      backLabel={step === 0 ? "Cancel" : "Back"}
      nextLabel={isLastStep ? "Create User" : "Continue"}
      loading={creating}
      headerContent={
        <Stepper steps={steps} activeStep={step} variant="circle" />
      }
    >
      <Box mt={1}>{renderStep()}</Box>
    </BaseModal>
  );
};

export default CreateUserModal;
