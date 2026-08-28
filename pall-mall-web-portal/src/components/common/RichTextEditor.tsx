import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";

import TextAlign from "@tiptap/extension-text-align";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import { Select, MenuItem } from "@mui/material";
import { DropdownIcon } from "@/assets";

import { Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import { useEffect } from "react";

import { useFileUpload } from "@/hooks/useFileUpload";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

const RichTextEditor = ({ value, onChange, error, helperText }: Props) => {
  const theme = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  type HeaderValue = "paragraph" | "1" | "2";

  const { uploadFile } = useFileUpload();

  const handleHeaderChange = (value: HeaderValue) => {
    if (!editor) return;

    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: value === "1" ? 1 : 2 })
        .run();
    }
  };


  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;

      const { url } = await uploadFile(file, "ContentUpload");

      editor.chain().focus().setImage({ src: url }).run();
    };

    input.click();
  };

  if (!editor) return null;

  return (
    <Box>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          rowGap: 0.4,
          gap: 0.1,
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderBottom: "none",
          p: 1,
          borderRadius: "8px 8px 0 0",
          bgcolor: "background.paper",
          justifyContent: "space-between",
        }}
      >
        {/*  Header Select */}
        <Select
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
                ? "2"
                : "paragraph"
          }
          onChange={(e) => handleHeaderChange(e.target.value as HeaderValue)}
          variant="standard"
          disableUnderline
          IconComponent={() => (
            <Box
              component="img"
              src={DropdownIcon}
              sx={{
                width: 12,
                height: 12,
                position: "absolute",
                right: 6,
                pointerEvents: "none",
              }}
            />
          )}
          MenuProps={{
            PaperProps: {
              sx: {
                mt: 0.5,
                borderRadius: "8px",
              },
            },
            MenuListProps: {
              sx: {
                py: 0.5,
              },
            },
          }}
          sx={{
            fontSize: 14,
            height: 30,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 0.5,
            "& .MuiSelect-select": {
              py: 0,
              pr: "20px !important",
            },
          }}
        >
          <MenuItem value="paragraph">Paragraph</MenuItem>
          <MenuItem value="1">Heading 1</MenuItem>
          <MenuItem value="2">Heading 2</MenuItem>
        </Select>

        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive("bold") ? "primary" : "default"}
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive("italic") ? "primary" : "default"}
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* <Tooltip title="Underline">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            color={editor.isActive("underline") ? "primary" : "default"}
          >
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip> */}

        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive("bulletList") ? "primary" : "default"}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Numbered List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive("orderedList") ? "primary" : "default"}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Alignment buttons */}
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          color={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}
        >
          <FormatAlignLeftIcon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          color={editor.isActive({ textAlign: "center" }) ? "primary" : "default"}
        >
          <FormatAlignCenterIcon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          color={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}
        >
          <FormatAlignRightIcon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          color={editor.isActive({ textAlign: "justify" }) ? "primary" : "default"}
        >
          <FormatAlignJustifyIcon fontSize="small" />
        </IconButton>

        <Tooltip title="Insert Image">
          <IconButton size="small" onClick={handleImageUpload}>
            <InsertPhotoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          borderRadius: "0 0 8px 8px",
          minHeight: 140,
          p: 1.5,
          "& .ProseMirror": {
            outline: "none",
            minHeight: "120px",
            fontSize: "14px",
            lineHeight: "20px",
          },
          "& img": {
            maxWidth: "100%",
            borderRadius: "8px",
            marginTop: "6px",
          },
          "& ul, & ol": {
            paddingLeft: "24px",
            margin: "8px 0",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {error && (
        <Typography sx={{ color: "error.main", mt: 0.5, fontSize: 12 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
export default RichTextEditor;
