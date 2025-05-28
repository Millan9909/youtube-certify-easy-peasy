
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import { VideoPlayerControls } from './VideoPlayerControls';
import { VideoPlayerProgress } from './VideoPlayerProgress';
import { VideoPlayerStatus } from './VideoPlayerStatus';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(video.progress?.watched_seconds || 0);
  const [hasWatched80Percent, setHasWatched80Percent] = useState(false);
  const [actualDuration, setActualDuration] = useState(video.duration_seconds);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize with saved progress
    setCurrentTime(video.progress?.watched_seconds || 0);
    const progress = actualDuration > 0 ? ((video.progress?.watched_seconds || 0) / actualDuration) * 100 : 0;
    setHasWatched80Percent(progress >= 80);
    
    // Start progress tracking when component mounts
    const startProgressTracking = () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      progressIntervalRef.current = setInterval(() => {
        if (iframeRef.current) {
          // Request current time and duration from YouTube
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"getCurrentTime","args":""}',
            'https://www.youtube.com'
          );
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"getDuration","args":""}',
            'https://www.youtube.com'
          );
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"getPlayerState","args":""}',
            'https://www.youtube.com'
          );
        }
      }, 1000);
    };

    // Listen to YouTube player events
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      try {
        const data = JSON.parse(event.data);
        
        // Handle different response types from YouTube API
        if (data.event === 'infoDelivery') {
          // Get current time
          if (data.info && typeof data.info.currentTime === 'number') {
            const newTime = Math.floor(data.info.currentTime);
            setCurrentTime(newTime);
            
            const progress = actualDuration > 0 ? (newTime / actualDuration) * 100 : 0;
            onProgressUpdate(video.id, progress);
            
            if (progress >= 80 && !hasWatched80Percent) {
              setHasWatched80Percent(true);
            }
            
            // Auto-save progress every 10 seconds
            if (newTime % 10 === 0 && user) {
              updateVideoProgress(newTime, progress >= 100);
            }
            
            // Complete video when 100% watched
            if (progress >= 100 && !video.progress?.completed) {
              onComplete(video.id);
              setIsPlaying(false);
              
              if (user) {
                supabase.from('notifications').insert({
                  user_id: user.id,
                  title: 'فيديو مكتمل',
                  message: `تم إكمال فيديو "${video.title}" بنجاح`,
                  type: 'success'
                });
              }
            }
          }
          
          // Get duration
          if (data.info && typeof data.info.duration === 'number') {
            const newDuration = Math.floor(data.info.duration);
            if (newDuration !== actualDuration && newDuration > 0) {
              setActualDuration(newDuration);
              console.log('Updated video duration to:', newDuration);
            }
          }
          
          // Get player state
          if (data.info && typeof data.info.playerState === 'number') {
            setIsPlaying(data.info.playerState === 1); // 1 = playing
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Start tracking after a short delay to ensure iframe is loaded
    const initTimeout = setTimeout(() => {
      startProgressTracking();
    }, 2000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      clearTimeout(initTimeout);
    };
  }, [video.id, video.progress, actualDuration, onComplete, onProgressUpdate, hasWatched80Percent, user]);

  const updateVideoProgress = async (watchedSeconds: number, completed: boolean) => {
    if (!user) return;

    try {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          video_id: video.id,
          watched_seconds: watchedSeconds,
          completed: completed,
          last_watched_at: new Date().toISOString()
        });

      // Update watch statistics
      const minutesWatched = Math.floor(watchedSeconds / 60);
      if (minutesWatched > 0) {
        await supabase.rpc('update_watch_stats', {
          _user_id: user.id,
          _video_id: video.id,
          _minutes_watched: 1
        });
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  const togglePlay = () => {
    if (iframeRef.current) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow?.postMessage(
        `{"event":"command","func":"${command}","args":""}`,
        'https://www.youtube.com'
      );
    }
  };

  const restart = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        '{"event":"command","func":"seekTo","args":[0, true]}',
        'https://www.youtube.com'
      );
      iframeRef.current.contentWindow?.postMessage(
        '{"event":"command","func":"pauseVideo","args":""}',
        'https://www.youtube.com'
      );
    }
    
    setCurrentTime(0);
    setIsPlaying(false);
    setHasWatched80Percent(false);
    onProgressUpdate(video.id, 0);
    
    if (user) {
      updateVideoProgress(0, false);
    }
  };

  const timeRemaining = Math.max(0, actualDuration - currentTime);

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
          <div className="relative">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${video.youtube_video_id}?enablejsapi=1&origin=${window.location.origin}`}
              title={video.title}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          <div className="space-y-4">
            <VideoPlayerControls
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onRestart={restart}
              currentTime={currentTime}
              duration={actualDuration}
            />

            <VideoPlayerProgress
              currentTime={currentTime}
              duration={actualDuration}
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
