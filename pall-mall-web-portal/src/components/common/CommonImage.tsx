import { Box, BoxProps, Skeleton } from "@mui/material";
import { useState, SyntheticEvent } from "react";

interface CommonImageProps extends BoxProps<"img"> {
  src: string;
  alt: string;
}

const CommonImage = ({ src, alt, sx, ...props }: CommonImageProps) => {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    if (props.onLoad) {
      props.onLoad(e);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%", // Default to filling parent, overriding via sx is possible
        height: "100%",
        display: "flex", // Removes 4px whitespace at bottom of inline-block
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "action.hover", // Placeholder background
        ...sx, // Apply passed dimensions/radius/etc to the wrapper
      }}
    >
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
        />
      )}
      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={handleLoad}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // Assumed default based on usage
          transition: "opacity 0.5s ease-in-out, filter 0.5s ease-in-out",
          opacity: loaded ? 1 : 0,
          filter: loaded ? "blur(0px)" : "blur(20px)",
          position: "relative",
          zIndex: 0,
        }}
        {...props}
      />
    </Box>
  );
};

export default CommonImage;
