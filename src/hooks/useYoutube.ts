
import { useState, useEffect } from 'react';

interface VideoInfo {
  title: string;
  duration: number; // in seconds
  thumbnail: string;
}

export const useYoutube = () => {
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getVideoInfo = async (videoId: string): Promise<VideoInfo | null> => {
    try {
      // محاكاة الحصول على معلومات الفيديو
      // في التطبيق الحقيقي، ستحتاج إلى YouTube API
      const mockDurations: { [key: string]: number } = {
        'dQw4w9WgXcQ': 212, // 3:32
        'default': 300 // 5:00 default
      };

      const duration = mockDurations[videoId] || mockDurations['default'];
      
      return {
        title: `فيديو تعليمي - ${videoId.substring(0, 8)}`,
        duration,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      };
    } catch (error) {
      console.error('Error fetching video info:', error);
      return null;
    }
  };

  return {
    extractVideoId,
    getVideoInfo
  };
};
