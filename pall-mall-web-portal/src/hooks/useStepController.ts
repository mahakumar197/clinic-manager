import { useState } from "react";

interface UseStepControllerProps {
  totalSteps: number;
  validateStep?: (stepIndex: number) => Promise<boolean> | boolean;
}

export const useStepController = ({ totalSteps, validateStep }) => {
  const [step, setStep] = useState(0);

  const nextStep = async () => {
    const valid = await validateStep(step);
    if (!valid) return;

    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const resetStep = () => setStep(0);

  const isLastStep = step === totalSteps - 1;

  return { step, nextStep, prevStep, resetStep, isLastStep };
};
