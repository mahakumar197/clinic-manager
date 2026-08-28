// uploadHandlers.ts
export const SUPPORTED_FORMATS: Record<string, { label: string; accept: string[] }> = {
    image: {
        label: "JPG, PNG, WebP",
        accept: ["image/jpeg", "image/png", "image/webp"],
    },
    video: {
        label: "MP4, MOV, WebM",
        accept: ["video/mp4", "video/quicktime", "video/webm"],
    },
    blog: {
        label: "PDF, DOCX, MD",
        accept: [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/markdown",
        ],
    },
    elearning: {
        label: "MP4, WebM, MOV",
        accept: ["video/mp4", "video/webm", "video/quicktime"],
    },
};
