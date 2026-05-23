import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, AlertCircle, CheckCircle, DollarSign, FileVideo, Image, Copy, Receipt } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'highlights',
    description: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pixCopied, setPixCopied] = useState(false);
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const proofInputRef = useRef(null);
  const navigate = useNavigate();

  const VIDEO_PRICE = 10;
  const pixKey = 'santossilvac990@gmail.com';

  const videoTypes = [
    { id: 'highlights', label: 'Melhores Momentos' },
    { id: 'training', label: 'Treino' },
    { id: 'match', label: 'Jogo' },
    { id: 'skills', label: 'Habilidades' },
    { id: 'goals', label: 'Gols' },
    { id: 'defense', label: 'Defesa' },
    { id: 'attack', label: 'Ataque' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo: 200MB.');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const removeFile = () => {
    setVideoFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Imagem muito grande. Máximo: 5MB.');
        return;
      }
      setThumbnailFile(file);
      // Cria preview da imagem
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (thumbInputRef.current) thumbInputRef.current.value = '';
  };

  const handleProofSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Comprovante muito grande. Máximo: 5MB.');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
    if (proofInputRef.current) proofInputRef.current.value = '';
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!videoFile) {
      setError('Selecione um vídeo para enviar.');
      return;
    }

    if (!proofFile) {
      setError('Anexe o comprovante de pagamento PIX (R$10,00).');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const uploadFile = async (url, formData, onProgress) => {
      const token = localStorage.getItem('token');
      return axios.post(`http://localhost:5000/api${url}`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        onUploadProgress: onProgress
      });
    };

    try {
      // 1. Upload do vídeo
      const videoForm = new FormData();
      videoForm.append('video', videoFile);
      const videoRes = await uploadFile('/upload/video', videoForm, (e) => {
        setUploadProgress(Math.round((e.loaded * 100) / e.total));
      });

      // 2. Upload do comprovante
      const proofForm = new FormData();
      proofForm.append('thumbnail', proofFile);
      const proofRes = await uploadFile('/upload/thumbnail', proofForm);

      // 3. Upload da thumbnail (se tiver)
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbForm = new FormData();
        thumbForm.append('thumbnail', thumbnailFile);
        const thumbRes = await uploadFile('/upload/thumbnail', thumbForm);
        thumbnailUrl = thumbRes.data.thumbnail_url;
      }

      // 4. Cria registro do vídeo com comprovante
      await api.post('/videos', {
        ...formData,
        video_url: videoRes.data.video_url,
        thumbnail: thumbnailUrl,
        payment_proof: proofRes.data.thumbnail_url
      });

      setSuccess('✅ Vídeo e comprovante enviados! Aguardando confirmação do admin.');

      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setProofFile(null);
      setProofPreview(null);
      setFormData({ title: '', type: 'highlights', description: '' });
      setUploadProgress(0);
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao enviar vídeo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Enviar Vídeo</h1>
          <p className="text-gray-400">Compartilhe seus melhores momentos com clubes e olheiros</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título do Vídeo *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                    placeholder="Ex: Melhores momentos - Campeonato Estadual 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Vídeo *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-3 px-4 text-white focus:border-accent focus:outline-none transition-colors"
                  >
                    {videoTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vídeo *
                  </label>
                  
                  {!videoFile ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-accent transition-colors bg-primary-dark/50"
                    >
                      <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300 font-medium mb-1">Clique para selecionar um vídeo</p>
                      <p className="text-gray-500 text-sm">MP4, WebM, MOV, AVI, MKV ou OGG • Máx. 200MB</p>
                    </div>
                  ) : (
                    <div className="bg-primary-dark border border-accent/30 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                          <FileVideo className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{videoFile.name}</p>
                          <p className="text-gray-400 text-sm">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                              <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-400 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/ogg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail / Capa do Vídeo (opcional)
                  </label>

                  {!thumbnailFile ? (
                    <div
                      onClick={() => thumbInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 transition-colors bg-primary-dark/50"
                    >
                      <Image className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300 font-medium mb-1">Clique para adicionar uma capa</p>
                      <p className="text-gray-500 text-sm">JPEG, PNG, WebP ou GIF • Máx. 5MB</p>
                    </div>
                  ) : (
                    <div className="bg-primary-dark border border-accent/30 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{thumbnailFile.name}</p>
                          <p className="text-gray-400 text-sm">{(thumbnailFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button type="button" onClick={removeThumbnail} className="text-gray-400 hover:text-red-400 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                  />
                </div>

                {/* COMPROVANTE PIX */}
                <div className="bg-accent/5 border border-accent/30 rounded-xl p-4">
                  <label className="block text-sm font-medium text-accent mb-2 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Comprovante de Pagamento PIX (obrigatório)
                  </label>

                  {!proofFile ? (
                    <div
                      onClick={() => proofInputRef.current?.click()}
                      className="border-2 border-dashed border-accent/30 rounded-xl p-6 text-center cursor-pointer hover:border-accent transition-colors bg-primary-dark/50"
                    >
                      <Receipt className="w-10 h-10 text-accent/50 mx-auto mb-2" />
                      <p className="text-white font-medium mb-1">Clique para anexar o comprovante</p>
                      <p className="text-gray-400 text-sm">Print do PIX de R$10,00 • JPEG, PNG ou WebP • Máx. 5MB</p>
                    </div>
                  ) : (
                    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <img src={proofPreview} alt="Comprovante" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{proofFile.name}</p>
                          <p className="text-gray-400 text-sm">{(proofFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button type="button" onClick={removeProof} className="text-gray-400 hover:text-red-400 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={proofInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProofSelect}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                    placeholder="Descreva o conteúdo do vídeo..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 btn-secondary py-3"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    {loading ? 'Enviando...' : 'Enviar Vídeo'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Pagamento</h3>
                  <p className="text-gray-400 text-sm">PIX — R$10,00 por vídeo</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-accent/10 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-accent mb-1">R$ 10,00</p>
                  <p className="text-gray-400 text-xs">por vídeo enviado</p>
                </div>

                <div className="bg-primary-dark rounded-lg p-4 border border-accent/30">
                  <p className="text-accent text-sm font-semibold mb-2">📌 Chave PIX (PagBank):</p>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="flex-1 bg-black/50 text-white text-xs px-3 py-2 rounded break-all">{pixKey}</code>
                    <button onClick={copyPixKey} className="p-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors flex-shrink-0">
                      <Copy className="w-4 h-4 text-accent" />
                    </button>
                  </div>
                  {pixCopied && <p className="text-green-400 text-xs">✓ Chave copiada!</p>}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-yellow-400 text-xs font-semibold mb-1">ℹ️ Como funciona:</p>
                  <ol className="text-gray-300 text-xs space-y-1">
                    <li>1. Faça o PIX de <strong className="text-white">R$10,00</strong></li>
                    <li>2. Tire print do comprovante</li>
                    <li>3. Anexe o comprovante no formulário</li>
                    <li>4. Envie o vídeo</li>
                    <li>5. Admin confirmará o pagamento</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
