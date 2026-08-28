// CreateRuleModal.tsx
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Stepper, BaseModal } from "@/components/common";
import { useStepController } from "@/hooks/useStepController";
import Step1RuleDetails from "./Step1RuleDetails";
import Step2Channels from "./Step2Channels";
import Step3Summary from "./Step3RecipientsSummary";
import { FinalRuleSchema } from "./Schemas";
import { toast } from "@/utils/toast";
import { useCreateRule } from "../../hooks/useCreateRules";

const steps = ["Rule Details", "Notification Channels", "Summary"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingRules?: any[];
}

const CreateRuleModal = ({
  open,
  onClose,
  onSuccess,
  existingRules = [],
}: Props) => {
  const {
    createRule,
    loading,
    error,
    reset: resetCreateRule,
  } = useCreateRule();

  const form = useForm({
    resolver: zodResolver(FinalRuleSchema),
    mode: "onChange",
    defaultValues: {
      ruleType: "notification",
      ruleName: "",
      triggerEvent: undefined,
      escalationCondition: undefined,
      escalationAction: undefined,
      channelInApp: false,
      channelEmail: false,
      channelDigest: false,
      recipients: [],
    },
  });

  const { trigger, handleSubmit, reset, watch, setError, clearErrors } = form;

  const ruleType = watch("ruleType");

  const handleClose = () => {
    reset();
    resetStep();
    resetCreateRule();
    onClose();
  };

  const validateStep = async (idx: number) => {
    if (idx === 0) {
      if (ruleType === "notification") {
        return await trigger(["ruleType", "ruleName", "triggerEvent"]);
      } else {
        return await trigger([
          "ruleType",
          "ruleName",
          "escalationCondition",
          "escalationAction",
        ]);
      }
    }

    if (idx === 1) {
      const values = form.getValues();
      const hasChannel =
        values.channelInApp || values.channelEmail || values.channelDigest;

      if (!hasChannel) {
        setError("channelInApp", {
          type: "manual",
          message: "At least one notification channel is required",
        });
        return false;
      }

      clearErrors("channelInApp");
      return true;
    }

    if (idx === 2) {
      return await trigger(["recipients"]);
    }

    return true;
  };

  const { step, nextStep, prevStep, resetStep, isLastStep } = useStepController(
    {
      totalSteps: steps.length,
      validateStep,
    }
  );

  const onSubmit = async (data: any) => {
    try {
      await createRule(data);

      toast.success("Rule created successfully");

      handleClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to create rule";

      toast.error(errorMessage);
    }
  };

  //  Reset everything when modal closes
  useEffect(() => {
    if (!open) {
      reset();
      resetStep();
      resetCreateRule();
    }
  }, [open]);

  const renderStep = () => {
    if (step === 0)
      return <Step1RuleDetails form={form} existingRules={existingRules} />;
    if (step === 1) return <Step2Channels form={form} />;
    if (step === 2) return <Step3Summary form={form} />;
    return null;
  };

  const subtitle = `Step ${step + 1} of ${steps.length}: ${steps[step]}`;

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Create New Rule"
      subtitle={subtitle}
      onBack={step === 0 ? onClose : prevStep}
      onNext={isLastStep ? handleSubmit(onSubmit) : nextStep}
      backLabel={step === 0 ? "Cancel" : "Back"}
      nextLabel={isLastStep ? "Create Rule" : "Next"}
      headerContent={
        <Stepper steps={steps} activeStep={step} variant="circle" />
      }
      loading={loading}
    >
      <Box mt={1}>
        {error && isLastStep && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              bgcolor: "error.light",
              color: "error.dark",
              borderRadius: 1,
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            {error}
          </Box>
        )}
        {renderStep()}
      </Box>
    </BaseModal>
  );
};

export default CreateRuleModal;
