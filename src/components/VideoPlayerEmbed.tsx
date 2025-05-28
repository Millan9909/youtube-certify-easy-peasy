
import { useEffect, useRef } from 'react';

interface VideoPlayerEmbedProps {
  videoId: string;
  title: string;
}

export const VideoPlayerEmbed = ({ videoId, title }: VideoPlayerEmbedProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Enable YouTube API communication
    const iframe = iframeRef.current;
    if (iframe) {
      // Request video data periodically
      const interval = setInterval(() => {
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"getCurrentTime","args":""}',
          'https://www.youtube.com'
        );
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"getDuration","args":""}',
          'https://www.youtube.com'
        );
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"getPlayerState","args":""}',
          'https://www.youtube.com'
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [videoId]);

  return (
    <iframe
      ref={iframeRef}
      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`}
      title={title}
      className="w-full aspect-video rounded-lg"
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  );
};
