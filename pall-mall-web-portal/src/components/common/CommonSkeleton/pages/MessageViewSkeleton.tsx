// CommonSkeleton/pages/MessageViewSkeleton.tsx

import React from "react";
import { Box } from "@mui/material";
import MessageCardSkeleton from "../cards/MessageCardSkeleton";
import { repeat } from "../utils";

const MessageViewSkeleton = () => {
  return (
    <Box>
      {repeat(6, (i) => (
        <MessageCardSkeleton key={i} />
      ))}
    </Box>
  );
};

export default MessageViewSkeleton;
