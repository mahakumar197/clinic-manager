import { Skeleton } from "@mui/material";

const TextLine = ({ width = "100%", height = 18 }) => (
  <Skeleton animation="wave" variant="text" width={width} height={height} />
);

export default TextLine;
