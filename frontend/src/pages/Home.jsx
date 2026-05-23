import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Users, Search, Trophy, ArrowRight, Star, Shield, Zap, X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';
import AthleteCard from '../components/AthleteCard';
import api from '../services/api';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [featuredAthletes, setFeaturedAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [canWatch, setCanWatch] = useState(false);

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  const fetchFeaturedContent = async () => {
    try {
      const [videosRes, athletesRes] = await Promise.all([
        api.get('/videos/public/featured?limit=4'),
        api.get('/athletes/all')
      ]);
      setFeaturedVideos(videosRes.data.videos || []);
      setCanWatch(videosRes.data.canWatch || false);
      setFeaturedAthletes(athletesRes.data.slice(0, 4));
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!canWatch) {
      navigate('/planos');
      return;
    }
    if (video.video_url) {
      setSelectedVideo(video);
    }
  };

  const sports = [
    { name: 'Futebol', icon: '⚽' },
    { name: 'Basquete', icon: '🏀' },
    { name: 'Vôlei', icon: '🏐' },
    { name: 'Tênis', icon: '🎾' },
    { name: 'Natação', icon: '🏊' },
    { name: 'MMA', icon: '🥊' },
  ];

  return (
    <div>
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Vídeo de fundo em loop */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[0.8]"
          src="/video/hero.mp4"
        />
        {/* Overlay escuro para legibilidade do texto */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary-dark/60 to-dark/70"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d4af37%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-medium">Plataforma #1 de Talentos Esportivos</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Descubra os{' '}
              <span className="text-gradient">Próximos Craques</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
              A maior plataforma multiesportiva de scouting do Brasil. 
              Conectando atletas, clubes e olheiros.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                Sou Atleta
              </Link>
              <Link to="/planos" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Sou Clube/Olheiro
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">1000+</div>
                <div className="text-gray-400 text-sm">Atletas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">500+</div>
                <div className="text-gray-400 text-sm">Clubes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">50+</div>
                <div className="text-gray-400 text-sm">Esportes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-dark/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Esportes <span className="text-gradient">Suportados</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sports.map((sport) => (
              <Link 
                key={sport.name}
                to={`/buscar?sport=${sport.name}`}
                className="card p-6 text-center hover:border-accent/50 transition-colors group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {sport.icon}
                </div>
                <span className="text-white font-medium">{sport.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              Vídeos em <span className="text-gradient">Destaque</span>
            </h2>
            <Link to="/buscar" className="text-accent hover:text-accent-light flex items-center gap-2 transition-colors">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-64 animate-pulse bg-primary-dark/50"></div>
              ))}
            </div>
          ) : featuredVideos.length === 0 ? (
            <div className="card p-8 text-center">
              <Play className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum vídeo em destaque no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredVideos.map((video) => (
                <div key={video.id} className="relative">
                  <VideoCard 
                    video={video} 
                    onClick={() => handleVideoClick(video)}
                  />
                  {video.locked && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex flex-col items-center justify-center gap-2 z-10">
                      <Lock className="w-8 h-8 text-accent" />
                      <span className="text-white text-sm font-medium">Assine para ver</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-primary-dark/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              Atletas em <span className="text-gradient">Destaque</span>
            </h2>
            <Link to="/buscar" className="text-accent hover:text-accent-light flex items-center gap-2 transition-colors">
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-80 animate-pulse bg-primary-dark/50"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAthletes.map((athlete) => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por que escolher a <span className="text-gradient">Craque Vision?</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Para Atletas</h3>
              <p className="text-gray-400">
                Crie seu perfil profissional, envie vídeos e seja descoberto pelos melhores clubes e olheiros do país.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Para Olheiros</h3>
              <p className="text-gray-400">
                Acesse uma base de dados completa de atletas com filtros avançados e vídeos profissionais.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Para Clubes</h3>
              <p className="text-gray-400">
                Encontre talentos para sua base e time profissional com segurança e praticidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-accent/20 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de atletas e clubes que já estão na Craque Vision.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Modal do Player de Vídeo */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedVideo(null)}>
          <div className="bg-primary-dark rounded-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h3 className="text-white font-bold text-lg">{selectedVideo.title}</h3>
                {selectedVideo.athlete_name && (
                  <p className="text-gray-400 text-sm">{selectedVideo.athlete_name}</p>
                )}
              </div>
              <button onClick={() => setSelectedVideo(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative bg-black">
              <video
                controls
                autoPlay
                className="w-full max-h-[70vh]"
                src={selectedVideo.video_url}
                poster={selectedVideo.thumbnail}
              >
                Seu navegador não suporta o player de vídeo.
              </video>
            </div>
            {selectedVideo.description && (
              <div className="p-4">
                <p className="text-gray-400">{selectedVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
