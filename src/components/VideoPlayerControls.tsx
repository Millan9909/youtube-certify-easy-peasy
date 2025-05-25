
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from 'lucide-react';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  currentTime: number;
  duration: number;
}

export const VideoPlayerControls = ({ 
  isPlaying, 
  onTogglePlay, 
  onRestart, 
  currentTime, 
  duration 
}: VideoPlayerControlsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button onClick={onTogglePlay} size="sm">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button onClick={onRestart} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-sm text-gray-600">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
};
