import { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import CommonIcon from "@/components/common/CommonIcon";

interface CustomVideoPlayerProps {
    src: string;
}

export default function CustomVideoPlayer({ src }: CustomVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    return (
        <Box
            sx={{
                mt: 0.5,
                maxWidth: 340,
                width: "100%",
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                bgcolor: "black", // Video background usually black
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <video
                ref={videoRef}
                src={src}
                controls={isPlaying} // Only show controls when playing? Or always? WhatsApp usually shows controls once playing.
                onPlay={handlePlay}
                onPause={handlePause}
                style={{
                    width: "100%",
                    maxHeight: 300,
                    display: "block",
                }}
            />

            {/* Overlay Play Button (Only visible when NOT playing) */}
            {!isPlaying && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(0,0,0,0.3)", // Dim overlay
                        cursor: "pointer",
                    }}
                    onClick={togglePlay}
                >
                    <Box
                        sx={{
                            width: 50,
                            height: 50,
                            bgcolor: "rgba(0,0,0,0.6)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        <CommonIcon name="Play" size={24} color="white" fill="white" />
                    </Box>
                </Box>
            )}
        </Box>
    );
}
