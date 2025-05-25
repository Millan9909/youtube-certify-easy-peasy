
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  url: string;
  duration: number;
  completed: boolean;
  progress: number;
}

interface VideoPlayerProps {
  video: Video;
  onComplete: (videoId: string) => void;
  onProgressUpdate: (videoId: string, progress: number) => void;
}

export const VideoPlayer = ({ video, onComplete, onProgressUpdate }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasWatched80Percent, setHasWatched80Percent] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

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

  const videoId = extractVideoId(video.url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0` : '';

  useEffect(() => {
    // محاكاة تتبع التقدم
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const progress = duration > 0 ? (newTime / duration) * 100 : 0;
          
          onProgressUpdate(video.id, progress);
          
          // فحص إذا وصل المستخدم لـ 80% من الفيديو
          if (progress >= 80 && !hasWatched80Percent) {
            setHasWatched80Percent(true);
          }
          
          // إكمال الفيديو عند الوصول للنهاية
          if (progress >= 95) {
            onComplete(video.id);
            setIsPlaying(false);
          }
          
          return newTime;
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
  }, [isPlaying, duration, video.id, onComplete, onProgressUpdate, hasWatched80Percent]);

  useEffect(() => {
    // تعيين مدة وهمية للفيديو (في التطبيق الحقيقي ستأتي من YouTube API)
    setDuration(300); // 5 دقائق كمثال
  }, [video.id]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setHasWatched80Percent(false);
    onProgressUpdate(video.id, 0);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const timeRemaining = Math.max(0, duration - currentTime);

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
            {video.completed && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">مكتمل</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* مشغل الفيديو */}
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {embedUrl ? (
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={video.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>رابط الفيديو غير صحيح</p>
                </div>
              )}
            </div>
          </div>

          {/* أدوات التحكم */}
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
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* شريط التقدم */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>التقدم</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* معلومات التقدم */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">حالة المشاهدة:</span>
                  <span className={`text-sm ${video.completed ? 'text-green-600' : 'text-blue-600'}`}>
                    {video.completed ? 'مكتمل' : hasWatched80Percent ? 'جاري المشاهدة' : 'لم يكتمل بعد'}
                  </span>
                </div>
                
                {!video.completed && (
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

                {timeRemaining > 0 && !video.completed && (
                  <div className="text-sm text-gray-600">
                    الوقت المتبقي: {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
            </div>

            {/* رسالة الإكمال */}
            {video.completed && (
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
