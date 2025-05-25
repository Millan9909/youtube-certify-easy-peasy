
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

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

  const embedUrl = `https://www.youtube.com/embed/${video.youtube_video_id}?enablejsapi=1&rel=0`;

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

  const progress = video.duration_seconds > 0 ? (currentTime / video.duration_seconds) * 100 : 0;
  const timeRemaining = Math.max(0, video.duration_seconds - currentTime);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                title={video.title}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button onClick={togglePlay} size="sm">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button onClick={restart} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {formatTime(currentTime)} / {formatTime(video.duration_seconds)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>التقدم</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">حالة المشاهدة:</span>
                  <span className={`text-sm ${video.progress?.completed ? 'text-green-600' : 'text-blue-600'}`}>
                    {video.progress?.completed ? 'مكتمل' : hasWatched80Percent ? 'جاري المشاهدة' : 'لم يكتمل بعد'}
                  </span>
                </div>
                
                {!video.progress?.completed && (
                  <div className="text-sm text-gray-600">
                    {hasWatched80Percent ? (
                      <span className="text-green-600">
                        ✓ تم مشاهدة 80% من الفيديو - تابع للحصول على الشهادة
                      </span>
                    ) : (
                      <span>
                        يجب مشاهدة 80% على الأقل من الفيديو للحصول على الشهادة
                      </span>
                    )}
                  </div>
                )}

                {timeRemaining > 0 && !video.progress?.completed && (
                  <div className="text-sm text-gray-600">
                    الوقت المتبقي: {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
            </div>

            {video.progress?.completed && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    تهانينا! لقد أكملت مشاهدة هذا الفيديو بنجاح
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
