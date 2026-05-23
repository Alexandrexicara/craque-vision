import { Play, Heart, Eye } from 'lucide-react';

const VideoCard = ({ video, onClick, showLikes = true }) => {
  return (
    <div 
      className="card overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-primary-dark">
        <img 
          src={video.thumbnail || '/placeholder-video.jpg'} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-12 h-12 text-white" />
        </div>
        {video.type && (
          <span className="absolute top-2 left-2 bg-accent text-primary-dark text-xs font-bold px-2 py-1 rounded">
            {video.type}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-semibold mb-2 line-clamp-2">{video.title}</h3>
        {video.athlete_name && (
          <p className="text-gray-400 text-sm mb-2">{video.athlete_name}</p>
        )}
        {showLikes && (
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {video.likes_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {video.views || 0}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
