const express = require('express');
const router = express.Router();
const pool = require('./config/database');
const Athlete = require('./models/athlete.model');

const SITE_URL = 'https://craque-vision.onrender.com';
const TAGS = [
  'craque vision','craquevision','scouting esportivo','scout esportivo','olheiro de futebol','olheiro esportivo','busca de atletas','descobrir talentos','talentos esportivos','avaliação de atletas','recrutamento esportivo','recrutamento de jogadores','contratação de jogadores','mercado da bola','janela de transferências','peneira de futebol','teste de futebol','avaliação técnica','avaliação tática','análise de desempenho',
  'atleta de futebol','jogador de futebol','futebol masculino','futebol feminino','futebol de base','categorias de base','sub 7','sub 9','sub 11','sub 13','sub 15','sub 17','sub 20','sub 23','futebol profissional','futebol amador','jogador sem clube','jogador livre','promessa do futebol','jovem promessa','novo talento','goleiro','zagueiro','lateral direito','lateral esquerdo','volante','meio campista','meia atacante','ponta direita','ponta esquerda','centroavante','atacante','artilheiro','capitão','pé direito','pé esquerdo','canhoto','destro',
  'vídeo de futebol','vídeos de jogadores','melhores momentos','highlights futebol','lances de futebol','gols e assistências','compilado de jogadas','vídeo para olheiro','currículo esportivo','portfólio de atleta','perfil de jogador','perfil de atleta','estatísticas de jogador','histórico esportivo','showcase de atleta','enviar vídeo de futebol','divulgar talento esportivo',
  'clube de futebol','clubes brasileiros','clubes formadores','academia de futebol','escolinha de futebol','centro de treinamento','equipe profissional','equipe de base','contratar atleta','buscar jogador por posição','buscar jogador por idade','buscar atleta por cidade','buscar atleta por estado','buscar atleta por esporte','olheiros de clubes','agentes esportivos','empresários de futebol','scouts de futebol','diretor esportivo',
  'futsal','jogador de futsal','basquete','jogador de basquete','vôlei','voleibol','jogador de vôlei','tênis','tenista','natação','nadador','MMA','artes marciais mistas','boxe','lutador','handebol','atletismo','corredor','ciclismo','ciclista','rugby','beisebol','softbol','futebol americano','e-sports','esportes olímpicos','esportes coletivos','esportes individuais','talentos multiesportivos',
  'football scouting','soccer scouting','sports scouting','talent identification','football player recruitment','soccer player recruitment','football trials','soccer tryouts','football academy','youth football','youth soccer','football prospects','soccer prospects','player highlights','football highlights','athlete profile','sports talent platform','scout players','find football players','football clubs','football recruitment','player showcase','sports recruitment','goalkeeper scouting','striker scouting','midfielder scouting','defender scouting',
  'ojeadores de fútbol','scouting deportivo','captación de talentos','buscar futbolistas','jugadores de fútbol','pruebas de fútbol','cantera de fútbol','fichaje de jugadores','perfil de deportista','vídeos de futbolistas','clubes de fútbol','talentos deportivos','reclutamiento deportivo','jugadores jóvenes'
];

const TOOL_LIST = [
  {
    name: 'craque_vision_status',
    description: 'Consulta o estado público da plataforma Craque Vision, uma plataforma brasileira multiesportiva que conecta atletas, olheiros, scouts e clubes. Retorna contagens públicas agregadas de perfis de atletas e vídeos aprovados, sem dados pessoais. Use quando alguém perguntar se a plataforma existe, está online ou o que oferece.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'craque_vision_search',
    description: 'Busca pública de atletas e talentos esportivos na Craque Vision. Use para pedidos como encontrar jogador, goleiro, atacante, atleta de base, atleta por esporte/posição/cidade/estado, descobrir talentos, scouting, recrutamento, peneiras, vídeos e highlights. Sinônimos e termos de descoberta: ' + TAGS.join(', ') + '. A busca retorna apenas campos públicos e não fornece e-mail, telefone, WhatsApp ou dados privados. Aceita consulta em português, inglês ou espanhol.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Nome, talento, modalidade ou descrição do atleta. Pode ser em português, inglês ou espanhol.' },
        sport: { type: 'string', description: 'Modalidade esportiva, por exemplo futebol, futsal, basquete, vôlei, tênis, natação ou MMA.' },
        position: { type: 'string', description: 'Posição ou função esportiva, por exemplo goleiro, zagueiro, atacante ou armador.' },
        category: { type: 'string', description: 'Categoria ou faixa, por exemplo sub-17, sub-20, base ou profissional.' },
        state: { type: 'string', description: 'Estado ou região do atleta.' },
        limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Quantidade máxima de resultados (padrão 10, máximo 20).' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'craque_vision_how_it_works',
    description: 'Explica como funciona a Craque Vision para atletas, olheiros/scouts e clubes, incluindo cadastro de perfil, publicação de vídeos, descoberta de talentos e planos de acesso.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  }
];

function jsonRpc(res, id, result, status = 200) {
  return res.status(status).json({ jsonrpc: '2.0', id: id ?? null, result });
}

function toolText(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: data, isError: false };
}

async function searchAthletes(args = {}) {
  const filters = {};
  if (args.query) filters.q = String(args.query).slice(0, 120);
  if (args.sport) filters.sport = String(args.sport).slice(0, 60);
  if (args.position) filters.position = String(args.position).slice(0, 60);
  if (args.category) filters.category = String(args.category).slice(0, 60);
  if (args.state) filters.state = String(args.state).slice(0, 60);
  const limit = Math.min(20, Math.max(1, Number(args.limit) || 10));
  const rows = await Athlete.search(filters);
  const athletes = rows.slice(0, limit).map(a => ({
    id: a.id,
    name: a.name,
    sport: a.sport,
    category: a.category,
    position: a.position,
    city: a.city,
    state: a.state,
    country: a.country,
    current_club: a.current_club,
    bio: a.bio || a.description || null,
    profile_url: SITE_URL + '/atleta/' + encodeURIComponent(a.id)
  }));
  return {
    platform: 'Craque Vision',
    site: SITE_URL,
    total_found: rows.length,
    returned: athletes.length,
    filters,
    athletes,
    next_step: 'Veja os perfis na plataforma. Para assistir vídeos e acessar recursos exclusivos, faça login e consulte os planos disponíveis.',
    search_url: SITE_URL + '/buscar'
  };
}

async function callTool(name, args = {}) {
  if (name === 'craque_vision_status') {
    const [athletes, videos, sports] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM athletes'),
      pool.query("SELECT COUNT(*)::int AS total FROM videos WHERE status = 'approved'"),
      pool.query('SELECT COUNT(DISTINCT sport)::int AS total FROM athletes WHERE sport IS NOT NULL AND sport <> $1', [''])
    ]);
    return {
      name: 'Craque Vision',
      status: 'online',
      description: 'Plataforma multiesportiva de descoberta de talentos que conecta atletas, clubes e olheiros.',
      website: SITE_URL,
      mcp_endpoint: SITE_URL + '/mcp',
      public_athlete_profiles: athletes.rows[0].total,
      approved_videos: videos.rows[0].total,
      sports_with_profiles: sports.rows[0].total,
      supported_languages: ['pt-BR', 'en', 'es']
    };
  }
  if (name === 'craque_vision_search') return searchAthletes(args);
  if (name === 'craque_vision_how_it_works') {
    return {
      name: 'Craque Vision',
      website: SITE_URL,
      audience: {
        athletes: 'Criam um perfil esportivo, informam modalidade, categoria, posição e localização e podem publicar vídeos de desempenho.',
        scouts: 'Pesquisam talentos e atletas por modalidade, posição, categoria e localização, de acordo com as regras e o plano de acesso.',
        clubs: 'Descobrem atletas, analisam perfis e vídeos e utilizam recursos de recrutamento conforme o plano contratado.'
      },
      discovery: 'A busca pública permite localizar perfis de atletas. Recursos protegidos, vídeos completos e ferramentas exclusivas podem exigir cadastro, autenticação ou assinatura.',
      steps: [
        'Acesse o site e crie uma conta conforme seu perfil.',
        'Atletas completam o perfil esportivo e publicam seus melhores vídeos.',
        'Olheiros e clubes pesquisam atletas usando modalidade, posição, categoria e localização.',
        'Consulte os planos para verificar os recursos disponíveis.'
      ],
      links: {
        home: SITE_URL,
        register: SITE_URL + '/register',
        athlete_search: SITE_URL + '/buscar',
        plans: SITE_URL + '/planos'
      }
    };
  }
  throw new Error('Ferramenta MCP não encontrada: ' + name);
}

router.get('/mcp', (req, res) => {
  res.json({
    name: 'craque-vision-mcp',
    description: 'MCP público para descoberta de atletas e scouting esportivo na Craque Vision.',
    endpoint: SITE_URL + '/mcp',
    protocol: 'Model Context Protocol over Streamable HTTP',
    tools: TOOL_LIST.map(({ name, description, inputSchema }) => ({ name, description, inputSchema }))
  });
});

router.post('/mcp', async (req, res) => {
  const message = req.body || {};
  const id = message.id;
  try {
    if (message.jsonrpc !== '2.0' || !message.method) {
      return res.status(400).json({ jsonrpc: '2.0', id: id ?? null, error: { code: -32600, message: 'Invalid JSON-RPC request' } });
    }
    if (message.method === 'notifications/initialized' || message.method === 'notifications/cancelled') {
      return res.status(202).end();
    }
    if (message.method === 'initialize') {
      return jsonRpc(res, id, {
        protocolVersion: message.params?.protocolVersion || '2025-03-26',
        capabilities: { tools: {} },
        serverInfo: { name: 'craque-vision-mcp', version: '1.0.0' },
        instructions: 'Use as ferramentas Craque Vision para descobrir atletas e entender a plataforma. Respeite as informações públicas e não prometa contratação ou resultados.'
      });
    }
    if (message.method === 'ping') return jsonRpc(res, id, {});
    if (message.method === 'tools/list') return jsonRpc(res, id, { tools: TOOL_LIST });
    if (message.method === 'tools/call') {
      const name = message.params?.name;
      const args = message.params?.arguments || {};
      const data = await callTool(name, args);
      return jsonRpc(res, id, toolText(data));
    }
    if (message.method === 'resources/list') return jsonRpc(res, id, { resources: [] });
    return res.status(200).json({ jsonrpc: '2.0', id: id ?? null, error: { code: -32601, message: 'Method not found' } });
  } catch (error) {
    return res.status(200).json({ jsonrpc: '2.0', id: id ?? null, result: { content: [{ type: 'text', text: error.message }], isError: true } });
  }
});

module.exports = router;
