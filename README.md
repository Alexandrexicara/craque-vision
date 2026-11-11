# Craque Vision

Plataforma multiesportiva de descoberta de talentos. Conectando atletas, clubes e olheiros.

## Descoberta por mecanismos de IA (MCP)

A Craque Vision disponibiliza um endpoint público compatível com JSON-RPC do Model Context Protocol (MCP), para que assistentes de IA possam consultar informações da plataforma e pesquisar perfis públicos de atletas.

- **Endpoint MCP:** https://craque-vision.onrender.com/mcp
- **Informações para assistentes:** https://craque-vision.onrender.com/llms.txt
- **Sitemap:** https://craque-vision.onrender.com/sitemap.xml
- **Robots:** https://craque-vision.onrender.com/robots.txt

### Ferramentas MCP

- `craque_vision_status`: status e indicadores públicos agregados.
- `craque_vision_search`: busca pública de atletas por texto, modalidade, posição, categoria e estado.
- `craque_vision_how_it_works`: explica os fluxos para atletas, olheiros/scouts e clubes.

### Termos de descoberta

O catálogo de descoberta inclui mais de 150 termos e sinônimos em português, inglês e espanhol, organizados em temas como futebol, futsal, basquete, vôlei, tênis, natação, MMA, outras modalidades, scouting, olheiros, clubes, recrutamento, peneiras, categorias de base, posições, vídeos, highlights e perfis de atletas.

O endpoint de busca retorna somente campos públicos do perfil. Não expõe e-mail, telefone, WhatsApp, credenciais ou informações privadas. Acesso a vídeos e recursos protegidos continua sujeito às regras de autenticação e assinatura da plataforma.

### Conectar em um cliente MCP

Use a URL `https://craque-vision.onrender.com/mcp` em clientes que aceitam servidores MCP remotos via HTTP. O serviço responde a `initialize`, `tools/list` e `tools/call`.

A presença do endpoint não significa integração automática com todos os assistentes: cada plataforma precisa aceitar e conectar servidores MCP.

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
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── mcp.js
│   └── server.js
├── frontend/
│   └── src/
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

## Licença

MIT
