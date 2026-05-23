import { Link } from 'react-router-dom';
import { Trophy, Instagram, Youtube, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-dark border-t border-accent/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-accent" />
              <span className="text-xl font-bold text-gradient">Craque Vision</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              A plataforma multiesportiva para descoberta de talentos. Conectando atletas, clubes e olheiros.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Atletas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="text-gray-400 hover:text-accent transition-colors">
                  Cadastrar
                </Link>
              </li>
              <li>
                <Link to="/planos" className="text-gray-400 hover:text-accent transition-colors">
                  Planos de Vídeos
                </Link>
              </li>
              <li>
                <Link to="/buscar" className="text-gray-400 hover:text-accent transition-colors">
                  Ver Atletas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Clubes e Olheiros</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/planos" className="text-gray-400 hover:text-accent transition-colors">
                  Planos de Assinatura
                </Link>
              </li>
              <li>
                <Link to="/buscar" className="text-gray-400 hover:text-accent transition-colors">
                  Buscar Talentos
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-accent transition-colors">
                  Criar Conta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-accent transition-colors">
                  Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-accent/10 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {currentYear} Craque Vision. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
