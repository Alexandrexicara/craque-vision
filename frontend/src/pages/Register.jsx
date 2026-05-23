import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Lock, Eye, EyeOff, Trophy, AlertCircle,
  CheckCircle, ChevronRight, ChevronLeft, Camera
} from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    user_type: 'athlete'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const userTypes = [
    { id: 'athlete', label: 'Atleta', icon: Camera, description: 'Quero ser descoberto' },
    { id: 'scout', label: 'Olheiro', icon: User, description: 'Busco talentos' },
    { id: 'club', label: 'Clube', icon: Trophy, description: 'Represento um clube' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeSelect = (type) => {
    setFormData({ ...formData, user_type: type });
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Nome é obrigatório';
    if (!formData.email.trim()) return 'E-mail é obrigatório';
    if (!formData.password) return 'Senha é obrigatória';
    if (formData.password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) return 'Senhas não coincidem';
    return null;
  };

  const nextStep = () => {
    const error = validateStep1();
    if (error) {
      setError(error);
      return;
    }
    setError('');
    setStep(2);
  };

  const prevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      user_type: formData.user_type
    });
    
    if (result.success) {
      const dashboardRoutes = {
        'athlete': '/dashboard',
        'scout': '/scout',
        'club': '/scout',
        'admin': '/admin'
      };
      navigate(dashboardRoutes[result.user.user_type] || '/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
            <p className="text-gray-400">Junte-se à maior plataforma de talentos</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-accent text-primary-dark' : 'bg-gray-600 text-gray-300'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-accent' : 'bg-gray-600'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-accent text-primary-dark' : 'bg-gray-600 text-gray-300'
            }`}>
              2
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
                    placeholder="Repita sua senha"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                Continuar
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Que tipo de usuário você é?
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {userTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleUserTypeSelect(type.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.user_type === type.id
                            ? 'border-accent bg-accent/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            formData.user_type === type.id ? 'bg-accent text-primary-dark' : 'bg-gray-600'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{type.label}</div>
                            <div className="text-sm text-gray-400">{type.description}</div>
                          </div>
                          {formData.user_type === type.id && (
                            <CheckCircle className="w-6 h-6 text-accent ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar Conta'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-accent hover:text-accent-light transition-colors">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
