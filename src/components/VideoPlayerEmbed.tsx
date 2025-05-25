
interface VideoPlayerEmbedProps {
  videoId: string;
  title: string;
}

export const VideoPlayerEmbed = ({ videoId, title }: VideoPlayerEmbedProps) => {
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;

  return (
    <div className="relative">
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          title={title}
        />
      </div>
    </div>
  );
};
