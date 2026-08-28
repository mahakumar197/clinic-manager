// BlogSection.tsx
import { RichTextEditor } from "@/components/common";
import { Box, Typography } from "@mui/material";
import { Controller } from "react-hook-form";

interface Props {
  form: any;
}

const BlogSection = ({ form }: Props) => {
  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 1.5 }}>
        Write a Blog
      </Typography>

      <Controller
        name="contentBody"
        control={form.control}
        render={({ field, fieldState }) => (
          <RichTextEditor
            value={field.value || ""}
            onChange={field.onChange}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    </Box>
  );
};

export default BlogSection;
