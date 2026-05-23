import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Search, Home, Trophy } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.user_type) {
      case 'athlete': return '/dashboard';
      case 'scout':
      case 'club': return '/scout';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  return (
    <nav className="bg-primary-dark/95 backdrop-blur-md border-b border-accent/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold text-gradient">Craque Vision</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-300 hover:text-accent transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Início
            </Link>
            <Link to="/buscar" className="text-gray-300 hover:text-accent transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar
            </Link>
            <Link to="/planos" className="text-gray-300 hover:text-accent transition-colors">
              Planos
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={getDashboardLink()}
                  className="text-gray-300 hover:text-accent transition-colors flex items-center gap-2"
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-accent/50"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center border-2 border-accent/30">
                      <User className="w-4 h-4 text-accent" />
                    </div>
                  )}
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-300 hover:text-accent transition-colors">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary">
                  Cadastrar
                </Link>
              </div>
            )}
          </div>

          <button 
            className="md:hidden text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-accent/20">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-gray-300 hover:text-accent transition-colors">
                Início
              </Link>
              <Link to="/buscar" className="text-gray-300 hover:text-accent transition-colors">
                Buscar Atletas
              </Link>
              <Link to="/planos" className="text-gray-300 hover:text-accent transition-colors">
                Planos
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} className="text-gray-300 hover:text-accent transition-colors">
                    Meu Perfil
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 transition-colors text-left"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-accent transition-colors">
                    Entrar
                  </Link>
                  <Link to="/register" className="btn-primary text-center">
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
