import { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton, Slider, useTheme, Avatar } from "@mui/material";
import CommonIcon from "@/components/common/CommonIcon";

interface CustomAudioPlayerProps {
    src: string;
    isOwnMessage?: boolean;
}

export default function CustomAudioPlayer({ src, isOwnMessage = false }: CustomAudioPlayerProps) {
    const theme = useTheme();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress(audio.currentTime);
        };

        const setAudioDuration = () => {
            setDuration(audio.duration);
        };

        const onEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", setAudioDuration);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", setAudioDuration);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleSpeed = () => {
        const speeds = [1, 1.5, 2];
        const nextSpeedIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
        setPlaybackRate(speeds[nextSpeedIndex]);
    };

    const handleSeek = (_: Event, newValue: number | number[]) => {
        const audio = audioRef.current;
        if (!audio) return;
        const time = newValue as number;
        audio.currentTime = time;
        setProgress(time);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const mainColor = theme.palette.text.primary;
    const secondaryColor = "text.secondary";
    // Use dark color for better contrast on yellow/light backgrounds
    const sliderColor = isOwnMessage ? "#F7F7F7" : theme.palette.primary.main;
    const railColor = isOwnMessage ? "rgba(0,0,0,0.2)" : "#e0e0e0";

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "end",
                gap: { xs: 1, md: 1.5 },
                p: { xs: 0.5, md: 1 },
                width: "100%",
                minWidth: { xs: 200, md: 260 },
            }}
        >
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Avatar / Mic Icon - Simplified WhatsApp style */}
            <Box sx={{ position: "relative" }}>
                <Avatar
                    sx={{
                        width: { xs: 32, md: 40 },
                        height: { xs: 32, md: 40 },
                        bgcolor: isPlaying ? "rgba(0,0,0,0.05)" : "transparent",
                        border: isPlaying ? "none" : `2px solid ${sliderColor}`,
                    }}
                >
                    <IconButton onClick={togglePlay} sx={{ color: sliderColor, p: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CommonIcon
                            name={isPlaying ? "Pause" : "Play"}
                            fill="currentColor"
                            size={18}
                        />
                    </IconButton>
                </Avatar>
            </Box>

            {/* Progress and Duration */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Slider
                    size="medium"
                    value={progress}
                    min={0}
                    max={duration || 100}
                    onChange={handleSeek}
                    sx={{
                        padding: "0px !important",
                        height: 4,
                        color: sliderColor,
                        "& .MuiSlider-thumb": {
                            width: 12,
                            height: 12,
                            bgcolor: sliderColor,
                            boxShadow: "none",
                            transition: "0.2s",
                            "&:before": { boxShadow: "none" },
                            "&:hover, &.Mui-focusVisible": { boxShadow: "none" },
                        },
                        "& .MuiSlider-rail": {
                            bgcolor: railColor,
                            opacity: 1,
                        },
                    }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                    <Typography variant="caption" sx={{ fontSize: "0.7rem", color: secondaryColor }}>
                        {formatTime(duration ? duration - progress : 0)}
                    </Typography>
                </Box>
            </Box>

            {/* Mic Icon & Speed */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                {/* Optional: Add Mic icon if it's a voice note, but for general audio player, maybe just speed */}
                <Box
                    onClick={toggleSpeed}
                    sx={{
                        bgcolor: "rgba(0,0,0,0.06)",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.1)" }
                    }}
                >
                    <Typography variant="caption" fontWeight="bold" sx={{ fontSize: "0.65rem", color: mainColor, lineHeight: 1 }}>
                        {playbackRate}x
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
