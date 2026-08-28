import { Box } from "@mui/material";

interface Props {
  steps: string[];
  activeStep: number;
}

const LineStepper = ({ steps, activeStep }: Props) => {
  return (
    <Box sx={{ display: "flex", gap: 1.2, mb: 3 }}>
      {steps.map((_, index) => {
        const isActiveOrCompleted = index <= activeStep;

        return (
          <Box
            key={index}
            sx={{
              flex: 1,
              height: "7px",
              borderRadius: 999,
              backgroundColor: "grey.300",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: isActiveOrCompleted ? "100%" : "0%",
                backgroundColor: "primary.main",
                transition: "width 0.40s ease",
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default LineStepper;
