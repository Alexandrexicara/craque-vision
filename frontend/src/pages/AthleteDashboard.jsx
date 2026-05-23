import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Video, User, BarChart3, Upload, Edit3, AlertCircle,
  Instagram, Phone, MapPin, Calendar, Ruler, Dumbbell, Save, X, Play, Clock, CheckCircle, ShieldX, Camera
} from 'lucide-react';
import api from '../services/api';
import VideoCard from '../components/VideoCard';

const SPORTS = ['Futebol', 'Futsal', 'Basquete', 'Vôlei', 'Handebol', 'Tênis', 'Atletismo', 'MMA', 'Jiu-Jitsu', 'Boxe', 'Natação', 'Skate', 'Surf', 'Ciclismo', 'Outros'];
const CATEGORIES = ['Sub-13', 'Sub-15', 'Sub-17', 'Sub-20', 'Profissional', 'Amador'];
const STATES = ['SP', 'RJ', 'MG', 'RS', 'BA', 'PR', 'PE', 'CE', 'SC', 'GO', 'DF', 'AM', 'PA', 'ES', 'Outro'];
const POSITIONS = {
  'Futebol': ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Ponta', 'Centroavante'],
  'Futsal': ['Goleiro', 'Fixo', 'Ala', 'Pivô'],
  'Basquete': ['Armador', 'Ala-armador', 'Ala', 'Ala-pivô', 'Pivô'],
  'Vôlei': ['Levantador', 'Oposto', 'Ponteiro', 'Central', 'Líbero'],
  'Handebol': ['Goleiro', 'Armador', 'Ponta', 'Pivô', 'Central']
};

const AthleteDashboard = () => {
  const { user, updateUser } = useAuth();
  const [athlete, setAthlete] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    sport: '',
    customSport: '',
    category: '',
    position: '',
    customPosition: '',
    city: '',
    state: '',
    birth_date: '',
    height: '',
    weight: '',
    whatsapp: '',
    instagram: '',
    current_club: '',
    bio: ''
  });

  // Esporte efetivo: o selecionado OU o digitado manualmente
  const effectiveSport = profileForm.sport === 'Outros' ? profileForm.customSport : profileForm.sport;

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => {
      const updated = { ...prev, [name]: value };
      // Limpa posição se o esporte não tem posições predefinidas
      if (name === 'sport') {
        if (!POSITIONS[value]) updated.position = '';
        if (value !== 'Outros') updated.customSport = '';
      }
      if (name === 'customSport') {
        updated.position = '';
      }
      return updated;
    });
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { customPosition, customSport, ...rest } = profileForm;
      const dataToSend = {
        ...rest,
        sport: effectiveSport,
        position: rest.position || customPosition
      };
      await api.post('/athletes/profile', dataToSend);
      await fetchData();
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      alert(error.response?.data?.error || 'Erro ao criar perfil');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [athleteRes, videosRes] = await Promise.all([
        api.get('/athletes/profile'),
        api.get('/videos/my-videos')
      ]);
      setAthlete(athleteRes.data);
      setVideos(videosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="card p-8">
            <div className="text-center mb-6">
              <AlertCircle className="w-12 h-12 text-accent mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Complete seu Perfil</h2>
              <p className="text-gray-400">Preencha os dados abaixo para começar a usar a plataforma</p>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Esporte *</label>
                  <select name="sport" value={profileForm.sport} onChange={handleProfileChange} required
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white focus:border-accent focus:outline-none">
                    <option value="">Selecione...</option>
                    {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {profileForm.sport === 'Outros' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Qual esporte? *</label>
                    <input type="text" name="customSport" value={profileForm.customSport} onChange={handleProfileChange}
                      placeholder="Ex: Rugby, Beisebol, Golfe..." required
                      className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
                  <select name="category" value={profileForm.category} onChange={handleProfileChange}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white focus:border-accent focus:outline-none">
                    <option value="">Selecione...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {effectiveSport && POSITIONS[effectiveSport] ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Posição</label>
                    <select name="position" value={profileForm.position} onChange={handleProfileChange}
                      className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white focus:border-accent focus:outline-none">
                      <option value="">Selecione...</option>
                      {POSITIONS[effectiveSport].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                ) : effectiveSport ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Área de Atuação *</label>
                    <input type="text" name="customPosition" value={profileForm.customPosition} onChange={handleProfileChange}
                      placeholder="Ex: Atacante, Piloto, Lutador..." required
                      className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cidade</label>
                  <input type="text" name="city" value={profileForm.city} onChange={handleProfileChange}
                    placeholder="Sua cidade"
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                  <select name="state" value={profileForm.state} onChange={handleProfileChange}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white focus:border-accent focus:outline-none">
                    <option value="">Selecione...</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Data de Nascimento</label>
                  <input type="date" name="birth_date" value={profileForm.birth_date} onChange={handleProfileChange}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white focus:border-accent focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Altura (ex: 1,80m)</label>
                  <input type="text" name="height" value={profileForm.height} onChange={handleProfileChange}
                    placeholder="1,80"
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Peso (ex: 75kg)</label>
                  <input type="text" name="weight" value={profileForm.weight} onChange={handleProfileChange}
                    placeholder="75"
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp</label>
                  <input type="text" name="whatsapp" value={profileForm.whatsapp} onChange={handleProfileChange}
                    placeholder="11999999999"
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                  <input type="text" name="instagram" value={profileForm.instagram} onChange={handleProfileChange}
                    placeholder="@seuperfil"
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Clube Atual</label>
                  <input type="text" name="current_club" value={profileForm.current_club} onChange={handleProfileChange}
                    placeholder="Nome do clube"
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Biografia / Descrição</label>
                <textarea name="bio" value={profileForm.bio} onChange={handleProfileChange} rows={3}
                  placeholder="Conte um pouco sobre você e sua trajetória..."
                  className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2.5 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none" />
              </div>

              <button type="submit" disabled={saving}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-5 h-5" />
                {saving ? 'Salvando...' : 'Criar Perfil'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(athlete.birth_date);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer"
                     onClick={() => document.getElementById('avatar-input').click()}>
                  <img 
                    src={user?.avatar || athlete.profile_photo || '/placeholder-athlete.jpg'} 
                    alt={user?.name}
                    className="w-full h-full object-cover rounded-full border-4 border-accent"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  {avatarUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                    </div>
                  )}
                </div>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">Clique na foto para alterar</p>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-accent">{athlete.sport}</p>
                {athlete.position && (
                  <p className="text-gray-400 text-sm">{athlete.position}</p>
                )}
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-primary-dark'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Perfil
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'videos' ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-primary-dark'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  Meus Vídeos
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'stats' ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-primary-dark'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas
                </button>
              </nav>

              <Link to="/upload" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                Enviar Vídeo
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Informações Pessoais</h3>
                    <button className="text-accent hover:text-accent-light flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Idade</p>
                        <p className="text-white">{age ? `${age} anos` : 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Localização</p>
                        <p className="text-white">
                          {athlete.city && athlete.state 
                            ? `${athlete.city}, ${athlete.state}` 
                            : 'Não informado'}
                        </p>
                      </div>
                    </div>

                    {athlete.height && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Ruler className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Altura</p>
                          <p className="text-white">{athlete.height}</p>
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
                          <p className="text-white">{athlete.weight}</p>
                        </div>
                      </div>
                    )}

                    {athlete.whatsapp && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">WhatsApp</p>
                          <p className="text-white">{athlete.whatsapp}</p>
                        </div>
                      </div>
                    )}

                    {athlete.instagram && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Instagram className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Instagram</p>
                          <p className="text-white">@{athlete.instagram}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {athlete.bio && (
                  <div className="card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Biografia</h3>
                    <p className="text-gray-400">{athlete.bio}</p>
                  </div>
                )}

                {athlete.goals && (
                  <div className="card p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Objetivos</h3>
                    <p className="text-gray-400">{athlete.goals}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Meus Vídeos ({videos.length})</h3>
                  <Link to="/upload" className="btn-primary flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Novo Vídeo
                  </Link>
                </div>

                {videos.length === 0 ? (
                  <div className="card p-8 text-center">
                    <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Nenhum vídeo ainda</h4>
                    <p className="text-gray-400 mb-4">Comece enviando seu primeiro vídeo!</p>
                    <Link to="/upload" className="btn-primary">Enviar Vídeo</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videos.map((video) => (
                      <div key={video.id} className="relative">
                        <VideoCard 
                          video={video} 
                          onClick={() => setSelectedVideo(video)}
                        />
                        <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded ${
                          video.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          video.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {video.status === 'approved' ? 'Aprovado' :
                           video.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal do Player de Vídeo */}
            {selectedVideo && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedVideo(null)}>
                <div className="bg-primary-dark rounded-2xl w-full max-w-4xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div>
                      <h3 className="text-white font-bold text-lg">{selectedVideo.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        selectedVideo.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        selectedVideo.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {selectedVideo.status === 'approved' ? '✓ Aprovado' :
                         selectedVideo.status === 'rejected' ? '✕ Rejeitado' : '⏳ Pendente'}
                      </span>
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

            {activeTab === 'stats' && (
              <div className="card p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Estatísticas</h3>
                <p className="text-gray-400">Em breve você poderá ver estatísticas detalhadas do seu perfil.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDashboard;
