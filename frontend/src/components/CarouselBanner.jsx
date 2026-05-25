import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CarouselBanner = () => {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get('/carousel')
      .then(res => setImages(res.data))
      .catch(() => {}); // silencioso se não houver imagens
  }, []);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % images.length);
  }, [images.length]);

  // Auto-loop a cada 4 segundos (sem setas, sem bolinhas)
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [images.length, next]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-primary-dark border-b border-gray-800" style={{ height: '280px' }}>
      {images.map((img, i) => (
        <div
          key={img.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {img.link ? (
            <a href={img.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <img
                src={img.image_url}
                alt={img.title || 'Anúncio'}
                className="w-full h-full object-cover"
              />
            </a>
          ) : (
            <img
              src={img.image_url}
              alt={img.title || 'Anúncio'}
              className="w-full h-full object-cover"
            />
          )}
          {img.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white text-sm font-medium">{img.title}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CarouselBanner;
