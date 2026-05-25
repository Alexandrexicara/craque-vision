import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Check, Crown, Star, Zap, AlertCircle, CheckCircle,
  Shield, Users, Search, Video
} from 'lucide-react';
import api from '../services/api';

const ClubPlans = () => {
  const { user, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/clubs/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planKey) => {
    if (!isAuthenticated) {
      navigate('/register?tipo=scout');
      return;
    }
    // Se for atleta, não pode assinar planos de scout/clube
    if (user?.user_type === 'athlete') {
      alert('Planos de clube/olheiro exigem conta do tipo "Olheiro" ou "Clube". Crie uma nova conta com o tipo correto.');
      return;
    }
    navigate(`/pagamento?plano=${planKey}`);
  };

  const planFeatures = {
    scout_basic: [
      'Acesso a perfis de atletas',
      'Busca por esporte e localização',
      'Até 10 favoritos',
      'Vídeos disponíveis após 24h',
      'Suporte por email'
    ],
    scout_pro: [
      'Tudo do Scout Basic',
      'Busca avançada com filtros',
      'Atletas ilimitados',
      'Vídeos disponíveis após 24h',
      'Contato direto com atletas',
      'Suporte prioritário'
    ],
    elite_club: [
      'Tudo do Scout Pro',
      'Vídeos em PRIMEIRA MÃO (sem espera)',
      'Exclusividade de 24h nos vídeos',
      'Dashboard exclusivo',
      'Relatórios personalizados',
      'API de integração',
      'Gerente de conta dedicado',
      'Suporte 24/7'
    ]
  };

  const planIcons = {
    scout_basic: Search,
    scout_pro: Star,
    elite_club: Crown
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Planos para <span className="text-gradient">Clubes e Olheiros</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Escolha o plano ideal para encontrar os melhores talentos esportivos do Brasil
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-accent text-sm">Plano Elite: acesso antecipado a TODOS os vídeos 24h antes</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(plans).map(([key, plan]) => {
            const Icon = planIcons[key] || Star;
            const features = planFeatures[key] || [];
            const isPopular = key === 'scout_pro';

            return (
              <div 
                key={key}
                className={`card p-8 relative ${isPopular ? 'border-accent scale-105' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-primary-dark text-sm font-bold px-4 py-1 rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isPopular ? 'bg-accent text-primary-dark' : 'bg-accent/10 text-accent'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-accent">
                      {key === 'elite_club' ? 'R$5.000' : key === 'scout_pro' ? 'R$197' : 'R$97'}
                    </span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(key)}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isPopular
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {isAuthenticated ? 'Assinar Agora' : 'Criar Conta'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 card p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Compare os Planos
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-accent/20">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Recurso</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">Scout Basic</th>
                  <th className="text-center py-4 px-4 text-accent font-semibold">Scout Pro</th>
                  <th className="text-center py-4 px-4 text-white font-semibold">Elite Club</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4 text-gray-300">Busca de atletas</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4 text-gray-300">Filtros avançados</td>
                  <td className="text-center py-4 px-4"><span className="text-gray-500">-</span></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4 text-gray-300">Favoritos</td>
                  <td className="text-center py-4 px-4 text-gray-400">10</td>
                  <td className="text-center py-4 px-4 text-accent">Ilimitado</td>
                  <td className="text-center py-4 px-4 text-accent">Ilimitado</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4 text-gray-300">Contato direto</td>
                  <td className="text-center py-4 px-4"><span className="text-gray-500">-</span></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-accent mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4 text-gray-300">Exclusividade 24h em vídeos</td>
                  <td className="text-center py-4 px-4"><span className="text-gray-500">-</span></td>
                  <td className="text-center py-4 px-4"><span className="text-gray-500">-</span></td>
                  <td className="text-center py-4 px-4"><Crown className="w-5 h-5 text-accent mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-4 px-4 text-gray-300 font-bold">Preço</td>
                  <td className="text-center py-4 px-4 text-white font-bold">R$97/mês</td>
                  <td className="text-center py-4 px-4 text-accent font-bold">R$197/mês</td>
                  <td className="text-center py-4 px-4 text-accent font-bold">R$5.000/mês</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-300">Suporte</td>
                  <td className="text-center py-4 px-4 text-gray-400">Email</td>
                  <td className="text-center py-4 px-4 text-accent">Prioritário</td>
                  <td className="text-center py-4 px-4 text-accent">24/7 Dedicado</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <Shield className="w-5 h-5 text-accent" />
            <span>Cancele a qualquer momento. Sem taxas ocultas.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubPlans;
