import { Box } from "@mui/material";

interface Props {
  steps: string[];
  activeStep: number;
}

const CircleStepper = ({ steps, activeStep }: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        mt: 1,
        mb: 3,
      }}
    >
      {steps.map((_, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;

        return (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              // groups before last stretch to fill (for lines),
              // last group is only the circle (no extra space at right)
              flex: index === steps.length - 1 ? "0 0 auto" : "1 0 0",
            }}
          >
            {/* Circle */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor:
                  isActive || isCompleted ? "primary.main" : "divider",
                color:
                  isActive || isCompleted
                    ? "primary.contrastText"
                    : "text.secondary",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background-color 0.3s ease, color 0.3s ease",
              }}
            >
              {index + 1}
            </Box>

            {/* Connector (after this circle, except last) */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#E6EBF2",
                  mx: 1.5,
                  overflow: "hidden",
                }}
              >
                {/* Animated fill: becomes yellow once you MOVE PAST this step */}
                <Box
                  sx={{
                    height: "100%",
                    width: activeStep > index ? "100%" : "0%",
                    backgroundColor: "primary.main",
                    transition: "width 0.4s ease",
                  }}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default CircleStepper;
