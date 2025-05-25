
import { Progress } from "@/components/ui/progress";

interface VideoPlayerProgressProps {
  currentTime: number;
  duration: number;
}

export const VideoPlayerProgress = ({ currentTime, duration }: VideoPlayerProgressProps) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>التقدم</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
