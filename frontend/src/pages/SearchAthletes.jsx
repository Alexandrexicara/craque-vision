import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import AthleteCard from '../components/AthleteCard';
import api from '../services/api';

const SearchAthletes = () => {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport: '',
    category: '',
    state: '',
    position: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const sports = ['Futebol', 'Futsal', 'Basquete', 'Vôlei', 'Handebol', 'Tênis', 'Atletismo', 'MMA', 'Jiu-Jitsu', 'Boxe', 'Natação', 'Skate', 'Surf', 'Ciclismo', 'Outros'];
  const categories = ['Sub-13', 'Sub-15', 'Sub-17', 'Sub-20', 'Profissional', 'Amador'];
  const positions = {
    'Futebol': ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Ponta', 'Centroavante'],
    'Futsal': ['Goleiro', 'Fixo', 'Ala', 'Pivô'],
    'Basquete': ['Armador', 'Ala-armador', 'Ala', 'Ala-pivô', 'Pivô'],
    'Vôlei': ['Levantador', 'Oposto', 'Ponteiro', 'Central', 'Líbero'],
    'Handebol': ['Goleiro', 'Armador', 'Ponta', 'Pivô', 'Central']
  };
  const [customPosition, setCustomPosition] = useState('');

  const fetchAthletes = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('q', searchQuery);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await api.get(`/athletes/search?${queryParams}`);
      setAthletes(response.data);
    } catch (error) {
      console.error('Erro ao buscar atletas:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAthletes();
    }, 300); // debounce: espera 300ms após última digitação
    return () => clearTimeout(timer);
  }, [fetchAthletes]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sport: '',
      category: '',
      state: '',
      position: ''
    });
    setCustomPosition('');
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Buscar Atletas</h1>
          <p className="text-gray-400">Encontre talentos esportivos por filtros específicos</p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full bg-primary-dark border border-gray-600 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
              {hasActiveFilters && (
                <span className="bg-accent text-primary-dark text-xs font-bold px-2 py-0.5 rounded-full">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="card p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Filtros Avançados</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Limpar filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Esporte</label>
                  <select
                    value={filters.sport}
                    onChange={(e) => handleFilterChange('sport', e.target.value)}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="">Todos</option>
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="">Todas</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="">Todos</option>
                    <option value="SP">São Paulo</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="BA">Bahia</option>
                    <option value="PR">Paraná</option>
                  </select>
                </div>

                {filters.sport && positions[filters.sport] ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Posição</label>
                    <select
                      value={filters.position}
                      onChange={(e) => handleFilterChange('position', e.target.value)}
                      className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-accent focus:outline-none"
                    >
                      <option value="">Todas</option>
                      {positions[filters.sport].map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                ) : filters.sport ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Área de Atuação</label>
                    <input
                      type="text"
                      value={customPosition}
                      onChange={(e) => {
                        setCustomPosition(e.target.value);
                        handleFilterChange('position', e.target.value);
                      }}
                      placeholder="Ex: Atacante, Zagueiro, Piloto..."
                      className="w-full bg-primary-dark border border-gray-600 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:border-accent focus:outline-none"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-gray-400">
            {athletes.length} atleta{athletes.length !== 1 ? 's' : ''} encontrado{athletes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-80 animate-pulse bg-primary-dark/50"></div>
            ))}
          </div>
        ) : athletes.length === 0 ? (
          <div className="card p-12 text-center">
            <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum atleta encontrado</h3>
            <p className="text-gray-400">Tente ajustar seus filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {athletes.map((athlete) => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAthletes;
