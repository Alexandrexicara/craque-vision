import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Video, CreditCard, BarChart3, AlertCircle,
  CheckCircle, XCircle, Trash2, Eye, Image, Upload, ImagePlus
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [carousel, setCarousel] = useState([]);
  const [carouselTitle, setCarouselTitle] = useState('');
  const [carouselLink, setCarouselLink] = useState('');
  const [carouselFile, setCarouselFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const carouselInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, videosRes, subsRes, carouselRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/videos'),
        api.get('/admin/subscriptions'),
        api.get('/carousel/admin')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setVideos(videosRes.data);
      setSubscriptions(subsRes.data);
      setCarousel(carouselRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVideo = async (videoId) => {
    try {
      await api.put(`/admin/videos/${videoId}/approve`);
      fetchData();
    } catch (error) {
      console.error('Erro ao aprovar vídeo:', error);
    }
  };

  const handleRejectVideo = async (videoId) => {
    try {
      await api.put(`/admin/videos/${videoId}/reject`, { reason: 'Conteúdo inadequado' });
      fetchData();
    } catch (error) {
      console.error('Erro ao rejeitar vídeo:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const handleApproveSubscription = async (subId) => {
    try {
      await api.put(`/payments/subscription/${subId}/approve`);
      fetchData();
    } catch (error) {
      console.error('Erro ao aprovar assinatura:', error);
    }
  };

  const handleRejectSubscription = async (subId) => {
    try {
      await api.put(`/payments/subscription/${subId}/reject`);
      fetchData();
    } catch (error) {
      console.error('Erro ao rejeitar assinatura:', error);
    }
  };

  const handleBlockSubscription = async (subId) => {
    if (!confirm('Tem certeza que deseja bloquear esta assinatura?')) return;
    try {
      await api.put(`/payments/subscription/${subId}/reject`);
      fetchData();
    } catch (error) {
      console.error('Erro ao bloquear assinatura:', error);
    }
  };

  // --- Carrossel handlers ---
  const handleCarouselUpload = async (e) => {
    e.preventDefault();
    if (!carouselFile) return;
    const formData = new FormData();
    formData.append('image', carouselFile);
    if (carouselTitle) formData.append('title', carouselTitle);
    if (carouselLink) formData.append('link', carouselLink);
    try {
      await api.post('/carousel', formData);
      setCarouselTitle('');
      setCarouselLink('');
      setCarouselFile(null);
      if (carouselInputRef.current) carouselInputRef.current.value = '';
      fetchData();
    } catch (error) {
      alert('Erro ao enviar imagem: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCarouselDelete = async (id) => {
    if (!confirm('Remover esta imagem do carrossel?')) return;
    try {
      await api.delete(`/carousel/${id}`);
      fetchData();
    } catch (error) {
      alert('Erro ao remover imagem.');
    }
  };

  const handleCarouselToggle = async (id, currentActive) => {
    try {
      await api.put(`/carousel/${id}`, { is_active: !currentActive });
      fetchData();
    } catch (error) {
      alert('Erro ao atualizar.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-gray-400">Gerencie usuários, vídeos e assinaturas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Usuários</p>
                <p className="text-3xl font-bold text-white">{stats.total_users || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-gray-400">Atletas: {stats.athletes_count || 0}</span>
              <span className="text-gray-400">Clubes: {stats.clubs_count || 0}</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Vídeos</p>
                <p className="text-3xl font-bold text-white">{stats.total_videos || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Assinaturas Ativas</p>
                <p className="text-3xl font-bold text-white">{stats.active_subscriptions || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Atletas</p>
                <p className="text-3xl font-bold text-white">{stats.total_athletes || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex border-b border-accent/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'overview' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'users' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'
              }`}
            >
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'videos' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'
              }`}
            >
              Vídeos
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'subscriptions' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'
              }`}
            >
              Assinaturas
            </button>
            <button
              onClick={() => setActiveTab('carousel')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'carousel' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'
              }`}
            >
              Carrossel
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Bem-vindo ao Painel Administrativo</h3>
                <p className="text-gray-400">Selecione uma aba acima para gerenciar diferentes áreas da plataforma.</p>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-4 text-gray-400 font-medium">Nome</th>
                      <th className="pb-4 text-gray-400 font-medium">Email</th>
                      <th className="pb-4 text-gray-400 font-medium">Tipo</th>
                      <th className="pb-4 text-gray-400 font-medium">Cadastro</th>
                      <th className="pb-4 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700/50">
                        <td className="py-4 text-white">{user.name}</td>
                        <td className="py-4 text-gray-400">{user.email}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.user_type === 'athlete' ? 'bg-blue-500/20 text-blue-400' :
                            user.user_type === 'club' ? 'bg-green-500/20 text-green-400' :
                            user.user_type === 'admin' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.user_type}
                          </span>
                        </td>
                        <td className="py-4 text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-4 text-gray-400 font-medium">Título</th>
                      <th className="pb-4 text-gray-400 font-medium">Atleta</th>
                      <th className="pb-4 text-gray-400 font-medium">Esporte</th>
                      <th className="pb-4 text-gray-400 font-medium">Status</th>
                      <th className="pb-4 text-gray-400 font-medium">Comprovante</th>
                      <th className="pb-4 text-gray-400 font-medium">Data</th>
                      <th className="pb-4 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video) => (
                      <tr key={video.id} className="border-b border-gray-700/50">
                        <td className="py-4 text-white">{video.title}</td>
                        <td className="py-4 text-gray-400">{video.athlete_name}</td>
                        <td className="py-4 text-gray-400">{video.sport}</td>
                        <td className="py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            video.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            video.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {video.status === 'approved' ? 'Aprovado' :
                             video.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-4">
                          {video.payment_proof ? (
                            <a href={video.payment_proof} target="_blank" rel="noreferrer"
                              className="text-accent hover:underline text-sm flex items-center gap-1">
                              <Image className="w-4 h-4" /> Ver
                            </a>
                          ) : (
                            <span className="text-gray-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-4 text-gray-400">
                          {new Date(video.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveVideo(video.id)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Aprovar"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectVideo(video.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Rejeitar"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-4 text-gray-400 font-medium">Usuário</th>
                      <th className="pb-4 text-gray-400 font-medium">Email</th>
                      <th className="pb-4 text-gray-400 font-medium">Plano</th>
                      <th className="pb-4 text-gray-400 font-medium">Status</th>
                      <th className="pb-4 text-gray-400 font-medium">Pagamento</th>
                      <th className="pb-4 text-gray-400 font-medium">Comprovante</th>
                      <th className="pb-4 text-gray-400 font-medium">Expiração</th>
                      <th className="pb-4 text-gray-400 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="border-b border-gray-700/50">
                        <td className="py-4 text-white">{sub.user_name}</td>
                        <td className="py-4 text-gray-400 text-sm">{sub.email}</td>
                        <td className="py-4 text-accent font-medium">{sub.plan_name}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            sub.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            sub.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                            sub.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            sub.status === 'pending_payment' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {sub.status === 'active' ? 'Ativo' :
                             sub.status === 'expired' ? 'Expirado' :
                             sub.status === 'cancelled' ? 'Cancelado' :
                             sub.status === 'pending_payment' ? 'Pendente' :
                             sub.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            sub.payment_status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            sub.payment_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {sub.payment_status === 'approved' ? 'Aprovado' :
                             sub.payment_status === 'rejected' ? 'Rejeitado' :
                             sub.payment_status === 'pending' ? 'Pendente' :
                             sub.payment_status || '—'}
                          </span>
                        </td>
                        <td className="py-4">
                          {sub.payment_proof ? (
                            <a href={sub.payment_proof} target="_blank" rel="noreferrer"
                              className="text-accent hover:underline text-sm flex items-center gap-1">
                              <Image className="w-4 h-4" /> Ver
                            </a>
                          ) : (
                            <span className="text-gray-500 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-4 text-gray-400 text-sm">
                          {new Date(sub.expires_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            {sub.payment_status === 'pending' && sub.payment_proof && (
                              <>
                                <button
                                  onClick={() => handleApproveSubscription(sub.id)}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Aprovar pagamento"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleRejectSubscription(sub.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Rejeitar pagamento"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {sub.status === 'active' && (
                              <button
                                onClick={() => handleBlockSubscription(sub.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Bloquear assinatura"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {subscriptions.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-500">
                          Nenhuma assinatura encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'carousel' && (
              <div>
                {/* Upload */}
                <div className="card p-6 mb-6 bg-primary-dark/50">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-accent" />
                    Adicionar ao Carrossel
                  </h3>
                  <form onSubmit={handleCarouselUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Título (opcional)</label>
                        <input
                          type="text"
                          value={carouselTitle}
                          onChange={(e) => setCarouselTitle(e.target.value)}
                          placeholder="Ex: Promoção de Verão"
                          className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:border-accent outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Link (opcional)</label>
                        <input
                          type="text"
                          value={carouselLink}
                          onChange={(e) => setCarouselLink(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:border-accent outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Imagem *</label>
                        <input
                          ref={carouselInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCarouselFile(e.target.files[0])}
                          className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-primary-dark file:font-medium hover:file:bg-accent/80"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!carouselFile}
                      className="btn-primary py-2 px-6 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Enviar
                    </button>
                  </form>
                </div>

                {/* Lista */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-700">
                        <th className="pb-4 text-gray-400 font-medium">Imagem</th>
                        <th className="pb-4 text-gray-400 font-medium">Título</th>
                        <th className="pb-4 text-gray-400 font-medium">Link</th>
                        <th className="pb-4 text-gray-400 font-medium">Ativo</th>
                        <th className="pb-4 text-gray-400 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carousel.map((item) => (
                        <tr key={item.id} className="border-b border-gray-700/50">
                          <td className="py-3">
                            <img src={item.image_url} alt="" className="w-24 h-16 object-cover rounded" />
                          </td>
                          <td className="py-3 text-white text-sm">{item.title || '—'}</td>
                          <td className="py-3 text-gray-400 text-sm">
                            {item.link ? (
                              <a href={item.link} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                                {item.link.length > 40 ? item.link.substring(0, 40) + '...' : item.link}
                              </a>
                            ) : '—'}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleCarouselToggle(item.id, item.is_active)}
                              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                item.is_active
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                  : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                              }`}
                            >
                              {item.is_active ? 'Sim' : 'Não'}
                            </button>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleCarouselDelete(item.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {carousel.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-gray-500">
                            Nenhuma imagem no carrossel. Adicione a primeira!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
