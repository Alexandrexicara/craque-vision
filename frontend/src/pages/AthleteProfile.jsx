import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Calendar, Ruler, Dumbbell, Instagram, Phone,
  Heart, Share2, Flag, AlertCircle, Play, Lock, Crown
} from 'lucide-react';
import api from '../services/api';
import VideoCard from '../components/VideoCard';

const AthleteProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [athlete, setAthlete] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Contato direto: admin, clubes, olheiros (normal e Elite), e o próprio atleta
  const canSeeContact = user && (
    user.user_type === 'admin' ||
    user.user_type === 'club' ||
    user.user_type === 'scout' ||
    (athlete && user.id === athlete.user_id)
  );

  useEffect(() => {
    fetchAthleteData();
  }, [id]);

  const fetchAthleteData = async () => {
    try {
      const [athleteRes, videosRes] = await Promise.all([
        api.get(`/athletes/${id}`),
        api.get(`/videos/athlete/${id}`)
      ]);
      setAthlete(athleteRes.data);
      setVideos(videosRes.data);
    } catch (error) {
      setError('Erro ao carregar perfil do atleta');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleFavorite = async () => {
    if (!user) {
      setError('Faça login para favoritar atletas');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/scout/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post('/scout/favorites', { athlete_id: id });
        setIsFavorite(true);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao favoritar atleta');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Atleta não encontrado</h2>
          <p className="text-gray-400">O perfil que você procura não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  const age = calculateAge(athlete.birth_date);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ml-auto">
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="card overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-r from-primary-dark to-primary"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6 gap-6">
              <div className="relative">
                <img 
                  src={athlete.avatar || athlete.profile_photo || '/placeholder-athlete.jpg'} 
                  alt={athlete.name}
                  className="w-32 h-32 rounded-full border-4 border-accent object-cover"
                />
              </div>
              
              <div className="flex-grow">
                <h1 className="text-3xl font-bold text-white mb-1">{athlete.name}</h1>
                <p className="text-accent text-lg">{athlete.sport}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {athlete.position && (
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                      {athlete.position}
                    </span>
                  )}
                  {athlete.category && (
                    <span className="bg-primary-dark text-gray-300 px-3 py-1 rounded-full text-sm">
                      {athlete.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isFavorite 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-primary-dark text-gray-300 hover:text-white border border-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                  Compartilhar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors">
                  <Flag className="w-5 h-5" />
                  Denunciar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {age && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Idade</p>
                    <p className="text-white font-semibold">{age} anos</p>
                  </div>
                </div>
              )}

              {athlete.city && athlete.state && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Localização</p>
                    <p className="text-white font-semibold">{athlete.city}, {athlete.state}</p>
                  </div>
                </div>
              )}

              {athlete.height && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Altura</p>
                    <p className="text-white font-semibold">{athlete.height}</p>
                  </div>
                </div>
              )}

              {athlete.weight && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Peso</p>
                    <p className="text-white font-semibold">{athlete.weight}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {athlete.bio && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Sobre</h3>
                <p className="text-gray-400">{athlete.bio}</p>
              </div>
            )}

            {athlete.current_club && (
              <div className="card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Clube Atual</h3>
                <p className="text-accent font-semibold">{athlete.current_club}</p>
              </div>
            )}

            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Vídeos ({videos.length})</h3>
              </div>
              
              {videos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum vídeo disponível</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {athlete.dominant_foot && (
              <div className="card p-6">
                <h3 className="font-semibold text-white mb-2">Pé Dominante</h3>
                <p className="text-gray-400 capitalize">{athlete.dominant_foot}</p>
              </div>
            )}

            {athlete.historic && (
              <div className="card p-6">
                <h3 className="font-semibold text-white mb-2">Histórico</h3>
                <p className="text-gray-400">{athlete.historic}</p>
              </div>
            )}

            {athlete.goals && (
              <div className="card p-6">
                <h3 className="font-semibold text-white mb-2">Objetivos</h3>
                <p className="text-gray-400">{athlete.goals}</p>
              </div>
            )}

            {(athlete.instagram || athlete.whatsapp) && (
              <div className="card p-6">
                <h3 className="font-semibold text-white mb-4">Contato</h3>
                
                {canSeeContact ? (
                  <div className="space-y-3">
                    {athlete.instagram && (
                      <a 
                        href={`https://instagram.com/${athlete.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-400 hover:text-accent transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                        @{athlete.instagram}
                      </a>
                    )}
                    {athlete.whatsapp && (
                      <a 
                        href={`https://wa.me/${athlete.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-400 hover:text-accent transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        {athlete.whatsapp}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Contato disponível para olheiros e clubes
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteProfile;
