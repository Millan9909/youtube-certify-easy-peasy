
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import { VideoPlayerControls } from './VideoPlayerControls';
import { VideoPlayerProgress } from './VideoPlayerProgress';
import { VideoPlayerStatus } from './VideoPlayerStatus';
import { VideoPlayerEmbed } from './VideoPlayerEmbed';

interface Video {
  id: string;
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  duration_seconds: number;
  progress?: {
    watched_seconds: number;
    completed: boolean;
  };
}

interface VideoPlayerProps {
  video: Video;
  onComplete: (videoId: string) => void;
  onProgressUpdate: (videoId: string, progress: number) => void;
}

export const VideoPlayer = ({ video, onComplete, onProgressUpdate }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(video.progress?.watched_seconds || 0);
  const [hasWatched80Percent, setHasWatched80Percent] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize with saved progress
    setCurrentTime(video.progress?.watched_seconds || 0);
    const progress = video.duration_seconds > 0 ? ((video.progress?.watched_seconds || 0) / video.duration_seconds) * 100 : 0;
    setHasWatched80Percent(progress >= 80);
  }, [video.id, video.progress, video.duration_seconds]);

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const progress = video.duration_seconds > 0 ? (newTime / video.duration_seconds) * 100 : 0;
          
          onProgressUpdate(video.id, progress);
          
          if (progress >= 80 && !hasWatched80Percent) {
            setHasWatched80Percent(true);
          }
          
          if (progress >= 95 && !video.progress?.completed) {
            onComplete(video.id);
            setIsPlaying(false);
          }
          
          return Math.min(newTime, video.duration_seconds);
        });
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, video.duration_seconds, video.id, onComplete, onProgressUpdate, hasWatched80Percent, video.progress?.completed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setHasWatched80Percent(false);
    onProgressUpdate(video.id, 0);
  };

  const timeRemaining = Math.max(0, video.duration_seconds - currentTime);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{video.title}</span>
            {video.progress?.completed && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">مكتمل</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <VideoPlayerEmbed 
            videoId={video.youtube_video_id} 
            title={video.title} 
          />

          <div className="space-y-4">
            <VideoPlayerControls
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onRestart={restart}
              currentTime={currentTime}
              duration={video.duration_seconds}
            />

            <VideoPlayerProgress
              currentTime={currentTime}
              duration={video.duration_seconds}
            />

            <VideoPlayerStatus
              isCompleted={video.progress?.completed || false}
              hasWatched80Percent={hasWatched80Percent}
              timeRemaining={timeRemaining}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
