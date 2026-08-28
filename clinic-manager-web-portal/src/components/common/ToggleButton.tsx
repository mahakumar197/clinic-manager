// import { styled } from "@mui/material/styles";
// import Switch, { SwitchProps } from "@mui/material/Switch";

// const ToggleSwitch = styled((props: SwitchProps) => (
//   <Switch
//     focusVisibleClassName=".Mui-focusVisible"
//     disableRipple
//     {...props}
//   />
// ))(({ theme }) => ({
//   width: 42,
//   height: 26,
//   padding: 0,
//   "& .MuiSwitch-switchBase": {
//     padding: 0,
//     margin: 2,
//     transitionDuration: "300ms",
//     "&.Mui-checked": {
//       transform: "translateX(16px)",
//       color: "#fff",
//       "& + .MuiSwitch-track": {
//         backgroundColor: "#65C466",
//         opacity: 1,
//         border: 0,
//         ...(theme.palette.mode === "dark" && {
//           backgroundColor: "#2ECA45",
//         }),
//       },
//       "&.Mui-disabled + .MuiSwitch-track": {
//         opacity: 0.5,
//       },
//     },
//     "&.Mui-focusVisible .MuiSwitch-thumb": {
//       color: "#33cf4d",
//       border: "6px solid #fff",
//     },
//     "&.Mui-disabled .MuiSwitch-thumb": {
//       color: theme.palette.grey[100],
//       ...(theme.palette.mode === "dark" && {
//         color: theme.palette.grey[600],
//       }),
//     },
//     "&.Mui-disabled + .MuiSwitch-track": {
//       opacity: 0.7,
//       ...(theme.palette.mode === "dark" && {
//         opacity: 0.3,
//       }),
//     },
//   },
//   "& .MuiSwitch-thumb": {
//     boxSizing: "border-box",
//     width: 22,
//     height: 22,
//   },
//   "& .MuiSwitch-track": {
//     borderRadius: 26 / 2,
//     backgroundColor: "#E9E9EA",
//     opacity: 1,
//     transition: theme.transitions.create(["background-color"], {
//       duration: 500,
//     }),
//     ...(theme.palette.mode === "dark" && {
//       backgroundColor: "#39393D",
//     }),
//   },
// }));

// export default ToggleSwitch;

import { styled } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";

const ToggleSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(() => ({
  width: 32,
  height: 18.4,
  padding: 0,
  display: "flex",

  "& .MuiSwitch-switchBase": {
    padding: 0,
    top: "50%",
    transform: "translateY(-50%)",
    transition: "0.2s",

    "&.Mui-checked": {
      transform: "translate(14px, -50%)",

      "& + .MuiSwitch-track": {
        backgroundColor: "#E5A400",
        opacity: 1,
      },
    },
  },

  "& .MuiSwitch-thumb": {
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    borderRadius: "50%",
    border: "1px solid #E5A400",
    transition: "0.2s",
    boxSizing: "border-box",
  },

  "& .MuiSwitch-track": {
    borderRadius: 9999,
    backgroundColor: "#FFF7E9",
    opacity: 1,
  },
}));

export default ToggleSwitch;

