import { MapPin, Calendar, Ruler, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

const AthleteCard = ({ athlete }) => {
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

  const age = calculateAge(athlete.birth_date);

  return (
    <Link to={`/atleta/${athlete.id}`} className="card overflow-hidden group hover:border-accent/50 transition-colors">
      <div className="relative h-48 bg-primary-dark">
        <img 
          src={athlete.profile_photo || '/placeholder-athlete.jpg'} 
          alt={athlete.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-accent text-primary-dark text-xs font-bold px-2 py-1 rounded">
          {athlete.sport}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1">{athlete.name}</h3>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {athlete.position && (
            <span className="text-xs bg-primary-dark text-gray-300 px-2 py-1 rounded">
              {athlete.position}
            </span>
          )}
          {athlete.category && (
            <span className="text-xs bg-primary-dark text-gray-300 px-2 py-1 rounded">
              {athlete.category}
            </span>
          )}
        </div>

        <div className="space-y-1 text-sm text-gray-400">
          {age && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{age} anos</span>
            </div>
          )}
          {athlete.city && athlete.state && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{athlete.city}, {athlete.state}</span>
            </div>
          )}
          {(athlete.height || athlete.weight) && (
            <div className="flex items-center gap-4">
              {athlete.height && (
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  {athlete.height}
                </span>
              )}
              {athlete.weight && (
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-4 h-4" />
                  {athlete.weight}
                </span>
              )}
            </div>
          )}
        </div>

        {athlete.current_club && (
          <div className="mt-3 pt-3 border-t border-accent/10">
            <p className="text-gray-400 text-sm">
              <span className="text-accent">Clube:</span> {athlete.current_club}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AthleteCard;
