import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Heart, Users, BarChart3, Star, Clock,
  AlertCircle, Crown, CheckCircle, XCircle, AlertTriangle, Camera
} from 'lucide-react';
import api from '../services/api';
import AthleteCard from '../components/AthleteCard';
import VideoCard from '../components/VideoCard';

const ScoutDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [favorites, setFavorites] = useState([]);
  const [recentAthletes, setRecentAthletes] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [favRes, athletesRes, videosRes, subRes] = await Promise.all([
        api.get('/scout/favorites'),
        api.get('/athletes/all'),
        api.get('/videos/featured?limit=4'),
        api.get('/payments/subscription/status')
      ]);
      
      setFavorites(favRes.data);
      setRecentAthletes(athletesRes.data.slice(0, 6));
      setFeaturedVideos(videosRes.data);
      setSubscription(subRes.data.subscription);
    } catch (error) {
      if (error.response?.status !== 404) {
        setError('Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/upload/avatar', formData);
      updateUser({ avatar: res.data.avatar_url });
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao enviar foto.');
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  const isSubscribed = subscription?.is_active;
  const daysUntilExpiry = subscription?.days_until_expiry || 0;
  const expiringSoon = subscription?.expiring_soon || false;
  const isPendingPayment = subscription?.payment_status === 'pending' && !subscription?.is_active;
  const isExpired = subscription?.status === 'expired';

  // Tela de não assinante / pendente / expirado
  if (!isSubscribed || isExpired || isPendingPayment) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="card p-8 text-center max-w-2xl mx-auto">
            {isPendingPayment ? (
              <>
                <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Pagamento Pendente</h2>
                <p className="text-gray-400 mb-6">
                  Seu comprovante de pagamento está sendo analisado pelo administrador.
                  A aprovação pode levar até 24h.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400 text-sm">
                    Status: Aguardando aprovação do administrador
                  </p>
                </div>
                <Link to="/pagamento" className="btn-secondary">
                  Ver Status do Pagamento
                </Link>
              </>
            ) : isExpired ? (
              <>
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Assinatura Expirada</h2>
                <p className="text-gray-400 mb-6">
                  Sua assinatura expirou. Renove agora para continuar acessando a plataforma.
                </p>
                <Link to="/planos" className="btn-primary">
                  Renovar Assinatura
                </Link>
              </>
            ) : (
              <>
                <Crown className="w-16 h-16 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Assinatura Necessária</h2>
                <p className="text-gray-400 mb-6">
                  Para acessar a área de olheiros e visualizar perfis completos de atletas, 
                  você precisa de uma assinatura ativa.
                </p>
                <Link to="/planos" className="btn-primary">
                  Ver Planos
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel do Olheiro</h1>
          <p className="text-gray-400">Gerencie seus favoritos e descubra novos talentos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative group cursor-pointer"
                       onClick={() => document.getElementById('scout-avatar-input').click()}>
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user?.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-accent/50"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center border-2 border-accent/30">
                        <Crown className="w-6 h-6 text-accent" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    {avatarUploading && (
                      <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                      </div>
                    )}
                  </div>
                  <input
                    id="scout-avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{user?.name}</h3>
                    <p className="text-accent text-sm">
                      {subscription?.plan_details?.name || 'Assinante'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Assinatura Ativa</span>
                  </div>
                  {subscription?.expires_at && (
                    <p className="text-gray-400 text-xs mt-1">
                      Expira em: {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                {/* Alerta de expiração próxima (5 dias) */}
                {expiringSoon && (
                  <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Atenção!</span>
                    </div>
                    <p className="text-red-300 text-xs mt-1">
                      Sua assinatura expira em <strong>{daysUntilExpiry} dia{daysUntilExpiry > 1 ? 's' : ''}</strong>.
                      Renove para não perder o acesso.
                    </p>
                    <Link
                      to={`/pagamento?plano=${subscription?.plan_name}`}
                      className="inline-block mt-2 text-xs text-accent hover:underline"
                    >
                      Renovar agora →
                    </Link>
                  </div>
                )}
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'dashboard' ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-primary-dark'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'favorites' ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-primary-dark'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  Favoritos
                  {favorites.length > 0 && (
                    <span className="ml-auto bg-accent text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </button>
                <Link
                  to="/buscar"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-primary-dark transition-colors"
                >
                  <Search className="w-5 h-5" />
                  Buscar Atletas
                </Link>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Favoritos</p>
                        <p className="text-2xl font-bold text-white">{favorites.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Atletas Disponíveis</p>
                        <p className="text-2xl font-bold text-white">{recentAthletes.length}+</p>
                      </div>
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Vídeos</p>
                        <p className="text-2xl font-bold text-white">{featuredVideos.length}+</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Atletas Recentes</h3>
                    <Link to="/buscar" className="text-accent hover:text-accent-light transition-colors">
                      Ver todos
                    </Link>
                  </div>
                  
                  {recentAthletes.length === 0 ? (
                    <div className="card p-8 text-center">
                      <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhum atleta cadastrado ainda</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recentAthletes.map((athlete) => (
                        <AthleteCard key={athlete.id} athlete={athlete} />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-6">Vídeos em Destaque</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredVideos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6">
                  Meus Favoritos ({favorites.length})
                </h3>
                
                {favorites.length === 0 ? (
                  <div className="card p-8 text-center">
                    <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Nenhum favorito ainda</h4>
                    <p className="text-gray-400 mb-4">Salve atletas favoritos para acompanhar facilmente</p>
                    <Link to="/buscar" className="btn-primary">Buscar Atletas</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((fav) => (
                      <AthleteCard key={fav.athlete_id} athlete={fav} />
                    ))}
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

export default ScoutDashboard;
