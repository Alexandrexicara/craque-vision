# Craque Vision

Plataforma multiesportiva de descoberta de talentos. Conectando atletas, clubes e olheiros.

## Funcionalidades

- **Cadastro de Atletas**: Crie seu perfil profissional
- **Upload de Vídeos**: Compartilhe seus melhores momentos
- **Busca Avançada**: Filtros por esporte, posição, idade, localização
- **Área de Olheiros**: Acesso exclusivo para assinantes
- **Sistema de Planos**: Scout Basic, Scout Pro e Elite Club
- **Favoritos**: Salve e acompanhe atletas
- **Painel Administrativo**: Controle total da plataforma

## Tecnologias

### Backend
- Node.js
- Express
- PostgreSQL
- JWT Authentication
- bcrypt

### Frontend
- React
- React Router
- Axios
- Tailwind CSS
- Lucide React

## Instalação

### Pré-requisitos
- Node.js (v16+)
- PostgreSQL

### Configuração do Backend

```bash
cd backend
npm install

# Crie o arquivo .env baseado no .env.example
cp .env.example .env

# Configure as variáveis de ambiente no arquivo .env
# Execute as migrations do banco de dados
npm run dev
```

### Configuração do Frontend

```bash
cd frontend
npm install

# Crie o arquivo .env baseado no .env.example
cp .env.example .env

npm run dev
```

## Estrutura do Projeto

```
craque-vision/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── athlete.controller.js
│   │   ├── video.controller.js
│   │   ├── scout.controller.js
│   │   ├── club.controller.js
│   │   ├── admin.controller.js
│   │   ├── like.controller.js
│   │   └── payment.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── athlete.model.js
│   │   ├── video.model.js
│   │   ├── subscription.model.js
│   │   ├── favorite.model.js
│   │   └── like.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── athlete.routes.js
│   │   ├── video.routes.js
│   │   ├── scout.routes.js
│   │   ├── club.routes.js
│   │   ├── admin.routes.js
│   │   └── payment.routes.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── VideoCard.jsx
│   │   │   └── AthleteCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AthleteDashboard.jsx
│   │   │   ├── AthleteProfile.jsx
│   │   │   ├── UploadVideo.jsx
│   │   │   ├── SearchAthletes.jsx
│   │   │   ├── ScoutDashboard.jsx
│   │   │   ├── ClubPlans.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── database/
│   └── schema.sql
└── README.md
```

## Rotas da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário

### Atletas
- `POST /api/athletes/profile` - Criar perfil
- `GET /api/athletes/profile` - Obter perfil
- `PUT /api/athletes/profile` - Atualizar perfil
- `GET /api/athletes/search` - Buscar atletas
- `GET /api/athletes/:id` - Perfil de atleta específico

### Vídeos
- `POST /api/videos` - Upload de vídeo
- `GET /api/videos/my-videos` - Meus vídeos
- `GET /api/videos/featured` - Vídeos em destaque
- `GET /api/videos/athlete/:athleteId` - Vídeos de atleta
- `POST /api/videos/like` - Curtir vídeo

### Olheiros
- `GET /api/scout/search` - Buscar atletas (requer assinatura)
- `POST /api/scout/favorites` - Adicionar favorito
- `GET /api/scout/favorites` - Listar favoritos

### Clubes
- `GET /api/clubs/plans` - Listar planos
- `POST /api/clubs/subscribe` - Assinar plano
- `GET /api/clubs/subscription` - Minha assinatura

### Admin
- `GET /api/admin/stats` - Estatísticas
- `GET /api/admin/users` - Listar usuários
- `GET /api/admin/videos` - Listar vídeos
- `PUT /api/admin/videos/:id/approve` - Aprovar vídeo
- `PUT /api/admin/videos/:id/reject` - Rejeitar vídeo

## Licença

MIT
