
import { CheckCircle } from 'lucide-react';

interface VideoPlayerStatusProps {
  isCompleted: boolean;
  hasWatched80Percent: boolean;
  timeRemaining: number;
}

export const VideoPlayerStatus = ({ 
  isCompleted, 
  hasWatched80Percent, 
  timeRemaining 
}: VideoPlayerStatusProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">حالة المشاهدة:</span>
            <span className={`text-sm ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
              {isCompleted ? 'مكتمل' : hasWatched80Percent ? 'جاري المشاهدة' : 'لم يكتمل بعد'}
            </span>
          </div>
          
          {!isCompleted && (
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

          {timeRemaining > 0 && !isCompleted && (
            <div className="text-sm text-gray-600">
              الوقت المتبقي: {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </div>

      {isCompleted && (
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
  );
};
