/**
 * Media Helper Functions
 * Utilities for extracting metadata from media files (video/audio)
 */

/**
 * Extract duration from a video file
 * @param file - Video file to extract duration from
 * @returns Promise<number> - Duration in seconds (integer, minimum 1)
 */
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      // Clean up object URL to prevent memory leaks
      window.URL.revokeObjectURL(video.src);
      
      // Return duration in seconds (integer), minimum 1 second
      const durationInSeconds = Math.max(1, Math.round(video.duration));
      resolve(durationInSeconds);
    };
    
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
};

/**
 * Extract duration from an audio file
 * @param file - Audio file to extract duration from
 * @returns Promise<number> - Duration in seconds (integer, minimum 1)
 */
export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    
    audio.onloadedmetadata = () => {
      // Clean up object URL to prevent memory leaks
      window.URL.revokeObjectURL(audio.src);
      
      // Return duration in seconds (integer), minimum 1 second
      const durationInSeconds = Math.max(1, Math.round(audio.duration));
      resolve(durationInSeconds);
    };
    
    audio.onerror = () => {
      window.URL.revokeObjectURL(audio.src);
      reject(new Error('Failed to load audio metadata'));
    };
    
    audio.src = URL.createObjectURL(file);
  });
};

/**
 * Extract duration from a media file (video or audio)
 * Automatically detects file type and uses appropriate method
 * @param file - Media file to extract duration from
 * @returns Promise<number> - Duration in seconds (integer, minimum 1)
 */
export const getMediaDuration = async (file: File): Promise<number> => {
  try {
    if (file.type.startsWith('video/')) {
      return await getVideoDuration(file);
    } else if (file.type.startsWith('audio/')) {
      return await getAudioDuration(file);
    } else {
      throw new Error('File is not a video or audio file');
    }
  } catch (error) {
    console.error('Failed to extract media duration:', error);
    throw error;
  }
};
