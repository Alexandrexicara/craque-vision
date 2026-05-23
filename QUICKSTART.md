# Craque Vision - Quick Start

## Iniciar o Projeto

### 1. Banco de Dados PostgreSQL

```bash
# Crie o banco de dados
createdb craque_vision

# Execute o schema
psql -d craque_vision -f database/schema.sql
```

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar servidor
npm run dev
```

Servidor rodando em: http://localhost:5000

### 3. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar aplicação
npm run dev
```

Aplicação rodando em: http://localhost:3000

## Tipos de Usuários

- **Atleta**: Cadastra perfil e envia vídeos
- **Scout/Clube**: Assina plano para buscar talentos
- **Admin**: Gerencia toda a plataforma

## Planos de Assinatura

- **Scout Basic**: R$49/mês - Busca básica, 10 favoritos
- **Scout Pro**: R$99/mês - Busca avançada, favoritos ilimitados
- **Elite Club**: R$299/mês - Dashboard exclusivo, API, suporte 24/7

## Pacotes de Vídeos

- 1 vídeo: R$10
- 5 vídeos: R$40
- 10 vídeos: R$70

## URLs Principais

- Home: http://localhost:3000
- Login: http://localhost:3000/login
- Cadastro: http://localhost:3000/register
- Planos: http://localhost:3000/planos
- Buscar: http://localhost:3000/buscar

## API Endpoints

- Base: http://localhost:5000/api
- Documentação completa no README.md
