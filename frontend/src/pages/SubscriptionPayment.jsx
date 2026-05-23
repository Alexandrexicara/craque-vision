import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard, Upload, CheckCircle, XCircle, Clock,
  AlertCircle, Crown, Copy, Check, ArrowRight, Shield
} from 'lucide-react';
import api from '../services/api';

const PLAN_NAMES = {
  scout_basic: 'Scout Basic',
  scout_pro: 'Scout Pro',
  elite_club: 'Elite Club'
};

const PLAN_PRICES = {
  scout_basic: 'R$97',
  scout_pro: 'R$197',
  elite_club: 'R$5.000'
};

const SubscriptionPayment = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planKey = searchParams.get('plano') || 'scout_basic';

  const [subscription, setSubscription] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const PIX_KEY = 'santossilvac990@gmail.com';
  const PIX_BANK = 'PagBank';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (user?.user_type === 'athlete' || user?.user_type === 'admin') {
      navigate('/');
      return;
    }
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const res = await api.get('/payments/subscription/status');
      if (res.data.has_subscription && res.data.subscription) {
        setSubscription(res.data.subscription);
      }
    } catch (err) {
      console.error('Erro ao verificar assinatura:', err);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      setError('');
      const res = await api.post('/payments/subscription', { plan_name: planKey });
      setSubscription(res.data.subscription);
      setSuccess('Assinatura criada! Agora envie o comprovante PIX abaixo.');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar assinatura.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 5MB.');
      return;
    }
    setProofFile(file);
    setError('');
  };

  const handleUploadProof = async () => {
    if (!proofFile) {
      setError('Selecione o comprovante primeiro.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('proof', proofFile);
      if (subscription) {
        formData.append('subscription_id', subscription.id);
      }

      const res = await api.post('/payments/subscription/proof', formData);
      setSubscription(res.data.subscription);
      setSuccess('✅ Comprovante enviado! Aguardando aprovação do administrador.');
      setProofFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar comprovante.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const planName = PLAN_NAMES[planKey] || 'Scout Basic';
  const planPrice = PLAN_PRICES[planKey] || 'R$97';

  // Status da assinatura
  const subStatus = subscription?.status;
  const paymentStatus = subscription?.payment_status;
  const isPendingApproval = paymentStatus === 'pending' && subscription?.payment_proof;
  const isActive = subStatus === 'active';
  const isRejected = subStatus === 'cancelled' || paymentStatus === 'rejected';

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Pagamento da <span className="text-gradient">Assinatura</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Finalize o pagamento para acessar a plataforma
          </p>
        </div>

        {/* Card do Plano */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center">
                <Crown className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{planName}</h3>
                <p className="text-gray-400">Acesso mensal à plataforma</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-accent">{planPrice}</span>
              <span className="text-gray-400 text-sm">/mês</span>
            </div>
          </div>
        </div>

        {/* Status ativo */}
        {isActive && (
          <div className="card p-6 mb-6 border-green-500/30">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="text-lg font-bold text-green-400">Assinatura Ativa!</h3>
                <p className="text-gray-400">
                  Expira em: {new Date(subscription.expires_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/scout" className="btn-primary inline-flex items-center gap-2">
                Ir para o Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Aguardando aprovação */}
        {isPendingApproval && (
          <div className="card p-6 mb-6 border-yellow-500/30">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <h3 className="text-lg font-bold text-yellow-400">Aguardando Aprovação</h3>
                <p className="text-gray-400">
                  Seu comprovante foi enviado e está sendo analisado pelo administrador.
                  A aprovação pode levar até 24h.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rejeitado */}
        {isRejected && (
          <div className="card p-6 mb-6 border-red-500/30">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-red-400">Assinatura Rejeitada</h3>
                <p className="text-gray-400">
                  Seu comprovante foi rejeitado. Entre em contato com o suporte ou tente novamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Criar assinatura (se não tiver nenhuma) */}
        {!subscription && !isActive && (
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Iniciar Assinatura</h3>
            <p className="text-gray-400 mb-4">
              Clique no botão abaixo para gerar sua assinatura e depois enviar o comprovante PIX.
            </p>
            <button onClick={handleCreateSubscription} className="btn-primary">
              Gerar Assinatura
            </button>
          </div>
        )}

        {/* PIX + Upload (se pendente ou sem comprovante) */}
        {subscription && !isActive && !isPendingApproval && !isRejected && (
          <>
            {/* Dados PIX */}
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                Dados para PIX
              </h3>

              <div className="bg-primary-dark/50 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-sm mb-2">Chave PIX (Email)</p>
                <div className="flex items-center justify-between">
                  <code className="text-white text-lg font-mono">{PIX_KEY}</code>
                  <button
                    onClick={handleCopyPix}
                    className="text-accent hover:text-accent-light transition-colors flex items-center gap-1 text-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="bg-primary-dark/50 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-sm mb-1">Banco</p>
                <p className="text-white font-medium">{PIX_BANK}</p>
              </div>

              <div className="bg-primary-dark/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Valor</p>
                <p className="text-accent text-2xl font-bold">{planPrice}</p>
              </div>
            </div>

            {/* Upload comprovante */}
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent" />
                Enviar Comprovante
              </h3>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('proof-input').click()}>
                  <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">
                    {proofFile ? proofFile.name : 'Clique para anexar o comprovante'}
                  </p>
                  <p className="text-gray-500 text-sm">JPG, PNG ou PDF (máx. 5MB)</p>
                  <input
                    id="proof-input"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <button
                  onClick={handleUploadProof}
                  disabled={uploading || !proofFile}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Enviando...
                    </span>
                  ) : (
                    'Enviar Comprovante'
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mensagens */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Passo a passo */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Como funciona?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <p className="text-gray-300">Escolha seu plano e clique em "Gerar Assinatura"</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <p className="text-gray-300">Faça o PIX para a chave indicada acima</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <p className="text-gray-300">Tire print do comprovante e envie aqui</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <p className="text-gray-300">O administrador aprovará seu pagamento e liberará o acesso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPayment;
