import { Box } from "@mui/material";
import LineStepper from "./LineStepper";
import CircleStepper from "./CircleStepper";

interface StepperProps {
  steps: string[];
  activeStep: number;
  variant?: "line" | "circle";
}

const Stepper = ({ steps, activeStep, variant = "line" }: StepperProps) => {
  return (
    <Box sx={{ width: "100%" }}>
      {variant === "line" ? (
        <LineStepper steps={steps} activeStep={activeStep} />
      ) : (
        <CircleStepper steps={steps} activeStep={activeStep} />
      )}
    </Box>
  );
};

export default Stepper;
