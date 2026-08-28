import { useState, useRef, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { CommonIconButton, CommonIcon } from "@/components/common";
import { useTheme } from "@mui/material";

interface VoiceRecorderProps {
  onCancel: () => void;
  onSend: (audioFile: File) => void;
  isSending?: boolean;
}

const VoiceRecorder = ({ onCancel, onSend, isSending = false }: VoiceRecorderProps) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      // Clear any leaked interval from StrictMode double-mount
      // Must be AFTER await so it catches intervals from the other async call
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onCancel(); // Exit if mic access fails
    }
  };

  const stopRecordingCleanup = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const handleFinish = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const audioFile = new File([audioBlob], "voice_note.weba", {
        type: "audio/webm",
      });
      onSend(audioFile);
    };

    stopRecordingCleanup();
  };

  const handleCancel = () => {
    stopRecordingCleanup();
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        width: "100%",
        bgcolor: "#f0f2f5", // Light grey background to distinguish from text input
        p: 1,
        borderRadius: "24px",
      }}
    >
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          bgcolor: theme.palette.error.main,
          animation: "pulse 1.5s infinite",
          "@keyframes pulse": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.5 },
            "100%": { opacity: 1 },
          },
        }}
      />
      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
        {formatDuration(duration)}
      </Typography>

      <CommonIconButton
        onClick={handleCancel}
        color="error"
        size="small"
        icon={<CommonIcon name="X" size={20} />}
      />

      <CommonIconButton
        onClick={handleFinish}
        color="primary"
        size="large"
        disabled={isSending}
        icon={
          isSending ? (
            <CircularProgress size={18} sx={{ color: "primary" }} />
          ) : (
            <CommonIcon name="SendHorizontal" size={18} />
          )
        }
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "50%",
          backgroundColor: "primary.main",
          color: "Background",
          ":hover": {
            backgroundColor: "primary.main",
          },
        }}
      />
    </Box>
  );
};

export default VoiceRecorder;
