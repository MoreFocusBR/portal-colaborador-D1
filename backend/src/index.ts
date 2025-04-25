import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';

// Middleware
app.use(cors());
app.use(express.json());

// Configuração da conexão com o PostgreSQL
// Nota: Em um ambiente de produção, estas credenciais viriam de variáveis de ambiente
const connectionString = "postgres://d1_orquestrador_db_user:m0rolZgKrck23Yd1p7rS72euVOtqxdI7@200.80.111.222:10066/d1_orquestrador_db";

// Criar pool de conexões
const pool = new Pool({
  connectionString,
});

// Testar conexão com o banco
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err);
  } else {
    console.log('Conexão com PostgreSQL estabelecida com sucesso');
  }
});

// Simulação de dados para transações financeiras
const transacoesSimuladas = [
  {
    id: '1',
    dataHora: '2025-04-20T10:30:00Z',
    tipoTransacao: 'PIX',
    tipoOperacao: 'C',
    valor: 1500.00,
    pagador: 'João Silva',
    documentoPagador: '123.456.789-00'
  },
  {
    id: '2',
    dataHora: '2025-04-21T14:15:00Z',
    tipoTransacao: 'Transferência',
    tipoOperacao: 'D',
    valor: 750.50,
    pagador: 'Maria Oliveira',
    documentoPagador: '987.654.321-00'
  },
  {
    id: '3',
    dataHora: '2025-04-22T09:45:00Z',
    tipoTransacao: 'Boleto',
    tipoOperacao: 'C',
    valor: 2300.75,
    pagador: 'Carlos Santos',
    documentoPagador: '456.789.123-00'
  },
  {
    id: '4',
    dataHora: '2025-04-23T16:20:00Z',
    tipoTransacao: 'PIX',
    tipoOperacao: 'C',
    valor: 450.00,
    pagador: 'Ana Pereira',
    documentoPagador: '789.123.456-00'
  },
  {
    id: '5',
    dataHora: '2025-04-24T11:10:00Z',
    tipoTransacao: 'Boleto',
    tipoOperacao: 'D',
    valor: 1200.25,
    pagador: 'Pedro Souza',
    documentoPagador: '321.654.987-00'
  }
];

// Simulação de dados para mensagens WhatsApp
const mensagensWhatsAppSimuladas = [
  {
    id: '1',
    status: 'Ativo',
    mensagem: 'Olá {{primeiroNome}}, seu pedido {{numeroPedido}} foi confirmado e está em processamento.',
    ativo: true
  },
  {
    id: '2',
    status: 'Pendente',
    mensagem: 'Olá {{primeiroNome}}, informamos que seu pedido {{numeroPedido}} foi enviado e chegará em breve.',
    ativo: false
  },
  {
    id: '3',
    status: 'Ativo',
    mensagem: 'Olá {{primeiroNome}}, seu pagamento de R$ {{valorPagamento}} foi confirmado.',
    ativo: true
  }
];

// Simulação de dados para mensagens Email
const mensagensEmailSimuladas = [
  {
    id: '1',
    status: 'Ativo',
    mensagem: 'Prezado(a) {{primeiroNome}},\n\nSeu pedido {{numeroPedido}} foi confirmado e está em processamento.\n\nAtenciosamente,\nEquipe de Suporte',
    ativo: true
  },
  {
    id: '2',
    status: 'Inativo',
    mensagem: 'Prezado(a) {{primeiroNome}},\n\nInformamos que seu pedido {{numeroPedido}} foi enviado e chegará em breve.\n\nAtenciosamente,\nEquipe de Logística',
    ativo: false
  },
  {
    id: '3',
    status: 'Pendente',
    mensagem: 'Prezado(a) {{primeiroNome}},\n\nSeu pagamento de R$ {{valorPagamento}} foi confirmado.\n\nAtenciosamente,\nEquipe Financeira',
    ativo: true
  }
];

// Simulação de dados para usuários
const usuariosSimulados = [
  {
    id: '1',
    nome: 'Administrador',
    email: 'admin@exemplo.com',
    senha: 'admin123', // Em produção, seria um hash
    grupos: ['1'],
    ultimaAtividade: '2025-04-24T15:30:00Z'
  },
  {
    id: '2',
    nome: 'Operador Financeiro',
    email: 'financeiro@exemplo.com',
    senha: 'financeiro123', // Em produção, seria um hash
    grupos: ['2'],
    ultimaAtividade: '2025-04-23T10:15:00Z'
  },
  {
    id: '3',
    nome: 'Atendente',
    email: 'atendimento@exemplo.com',
    senha: 'atendimento123', // Em produção, seria um hash
    grupos: ['3'],
    ultimaAtividade: '2025-04-22T14:45:00Z'
  }
];

// Simulação de dados para grupos
const gruposSimulados = [
  {
    id: '1',
    nome: 'Administradores',
    telasPermitidas: ['transacoes', 'mensagens-whatsapp', 'mensagens-email', 'usuarios', 'grupos', 'vendas']
  },
  {
    id: '2',
    nome: 'Financeiro',
    telasPermitidas: ['transacoes', 'vendas']
  },
  {
    id: '3',
    nome: 'Atendimento',
    telasPermitidas: ['mensagens-whatsapp', 'mensagens-email']
  }
];

// Simulação de dados para vendas
const vendasSimuladas = [
  {
    id: '1',
    numero: 'V-2025-001',
    data: '2025-04-20T10:30:00Z',
    status: 'Financeiro Validado',
    nomeCliente: 'João Silva',
    valorTotal: 1500.00,
    totalItens: 3
  },
  {
    id: '2',
    numero: 'V-2025-002',
    data: '2025-04-21T14:15:00Z',
    status: 'A Enviar',
    nomeCliente: 'Maria Oliveira',
    valorTotal: 750.50,
    totalItens: 2
  },
  {
    id: '3',
    numero: 'V-2025-003',
    data: '2025-04-22T09:45:00Z',
    status: 'Financeiro Validado',
    nomeCliente: 'Carlos Santos',
    valorTotal: 2300.75,
    totalItens: 5
  },
  {
    id: '4',
    numero: 'V-2025-004',
    data: '2025-04-23T16:20:00Z',
    status: 'Aguardando Estoque',
    nomeCliente: 'Ana Pereira',
    valorTotal: 450.00,
    totalItens: 1
  },
  {
    id: '5',
    numero: 'V-2025-005',
    data: '2025-04-24T11:10:00Z',
    status: 'Financeiro Validado',
    nomeCliente: 'Pedro Souza',
    valorTotal: 1200.25,
    totalItens: 4
  }
];

// Middleware de autenticação
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
    
    req.usuario = usuario;
    next();
  });
};

// Middleware de autorização
const verificarAutorizacao = (telaId) => {
  return (req, res, next) => {
    const usuario = req.usuario;
    
    // Verificar se o usuário tem autorização para acessar a tela
    const gruposDoUsuario = usuario.grupos || [];
    let autorizado = false;
    
    // Verificar cada grupo do usuário
    for (const grupoId of gruposDoUsuario) {
      const grupo = gruposSimulados.find(g => g.id === grupoId);
      
      if (grupo && grupo.telasPermitidas.includes(telaId)) {
        autorizado = true;
        break;
      }
    }
    
    if (!autorizado) {
      return res.status(403).json({ error: 'Acesso negado a este recurso' });
    }
    
    next();
  };
};

// Rota de autenticação
app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;
  
  // Validar dados
  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }
  
  // Buscar usuário pelo e-mail
  const usuario = usuariosSimulados.find(u => u.email === email);
  
  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  // Gerar token JWT
  const token = jwt.sign(
    { 
      id: usuario.id, 
      nome: usuario.nome, 
      email: usuario.email, 
      grupos: usuario.grupos 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
  
  // Atualizar última atividade
  usuario.ultimaAtividade = new Date().toISOString();
  
  // Retornar token e informações do usuário (sem a senha)
  const { senha: _, ...usuarioSemSenha } = usuario;
  
  // Simular um pequeno atraso
  setTimeout(() => {
    res.json({
      token,
      usuario: usuarioSemSenha
    });
  }, 500);
});

// Rota para obter transações financeiras (protegida)
app.get('/interExtratoD1', autenticarToken, verificarAutorizacao('transacoes'), (req, res) => {
  const { dataInicial, dataFinal, tipoTransacao } = req.query;
  
  let transacoesFiltradas = [...transacoesSimuladas];
  
  // Aplicar filtros se fornecidos
  if (dataInicial) {
    transacoesFiltradas = transacoesFiltradas.filter(
      t => new Date(t.dataHora) >= new Date(dataInicial as string)
    );
  }
  
  if (dataFinal) {
    transacoesFiltradas = transacoesFiltradas.filter(
      t => new Date(t.dataHora) <= new Date(dataFinal as string)
    );
  }
  
  if (tipoTransacao) {
    transacoesFiltradas = transacoesFiltradas.filter(
      t => t.tipoTransacao === tipoTransacao
    );
  }
  
  // Simular um pequeno atraso para demonstrar o estado de carregamento
  setTimeout(() => {
    res.json(transacoesFiltradas);
  }, 500);
});

// Rota para obter mensagens WhatsApp (protegida)
app.get('/mensagens-whatsapp', autenticarToken, verificarAutorizacao('mensagens-whatsapp'), (req, res) => {
  // Em um ambiente real, buscaríamos do PostgreSQL
  // Exemplo: const result = await pool.query('SELECT * FROM mensagens_whatsapp');
  
  // Simular um pequeno atraso para demonstrar o estado de carregamento
  setTimeout(() => {
    res.json(mensagensWhatsAppSimuladas);
  }, 500);
});

// Rota para atualizar status de mensagem WhatsApp (protegida)
app.patch('/mensagens-whatsapp/:id', autenticarToken, verificarAutorizacao('mensagens-whatsapp'), (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;
  
  // Em um ambiente real, atualizaríamos no PostgreSQL
  // Exemplo: await pool.query('UPDATE mensagens_whatsapp SET ativo = $1 WHERE id = $2', [ativo, id]);
  
  const mensagemIndex = mensagensWhatsAppSimuladas.findIndex(m => m.id === id);
  
  if (mensagemIndex === -1) {
    return res.status(404).json({ error: 'Mensagem não encontrada' });
  }
  
  mensagensWhatsAppSimuladas[mensagemIndex].ativo = ativo;
  
  // Simular um pequeno atraso
  setTimeout(() => {
    res.json(mensagensWhatsAppSimuladas[mensagemIndex]);
  }, 300);
});

// Rota para obter mensagens Email (protegida)
app.get('/mensagens-email', autenticarToken, verificarAutorizacao('mensagens-email'), (req, res) => {
  // Em um ambiente real, buscaríamos do PostgreSQL
  // Exemplo: const result = await pool.query('SELECT * FROM mensagens_email');
  
  // Simular um pequeno atraso para demonstrar o estado de carregamento
  setTimeout(() => {
    res.json(mensagensEmailSimuladas);
  }, 500);
});

// Rota para atualizar status de mensagem Email (protegida)
app.patch('/mensagens-email/:id', autenticarToken, verificarAutorizacao('mensagens-email'), (req, res) => {
  const { id } = req.params;
  const { ativo } = req.body;
  
  // Em um ambiente real, atualizaríamos no PostgreSQL
  // Exemplo: await pool.query('UPDATE mensagens_email SET ativo = $1 WHERE id = $2', [ativo, id]);
  
  const mensagemIndex = mensagensEmailSimuladas.findIndex(m => m.id === id);
  
  if (mensagemIndex === -1) {
    return res.status(404).json({ error: 'Mensagem não encontrada' });
  }
  
  mensagensEmailSimuladas[mensagemIndex].ativo = ativo;
  
  // Simular um pequeno atraso
  setTimeout(() => {
    res.json(mensagensEmailSimuladas[mensagemIndex]);
  }, 300);
});

// Rotas para gerenciamento de usuários (protegidas)
app.get('/usuarios', autenticarToken, verificarAutorizacao('usuarios'), (req, res) => {
  // Em um ambiente real, buscaríamos do PostgreSQL
  // Exemplo: const result = await pool.query('SELECT * FROM usuarios');
  
  // Remover senhas antes de enviar
  const usuariosSemSenha = usuariosSimulados.map(({ senha, ...resto }) => resto);
  
  // Simular um pequeno atraso para demonstrar o estado de carregamento
  setTimeout(() => {
    res.json(usuariosSemSenha);
  }, 500);
});

app.post('/usuarios', autenticarToken, verificarAutorizacao('usuarios'), (req, res) => {
  const { nome, email, grupos, ultimaAtividade } = req.body;
  
  // Validar dados
  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
  }
  
  // Em um ambiente real, inseriríamos no PostgreSQL
  // Exemplo: const result = await pool.query('INSERT INTO usuarios (nome, email, grupos, ultima_atividade) VALUES ($1, $2, $3, $4) RETURNING *', [nome, email, grupos, ultimaAtividade]);
  
  const novoUsuario = {
    id: uuidv4(),
    nome,
    email,
    senha: 'senha123', // Em produção, seria um hash
    grupos: grupos || [],
    ultimaAtividade: ultimaAtividade || new Date().toISOString()
  };
  
  usuariosSimulados.push(novoUsuario);
  
  // Remover senha antes de enviar
  const { senha, ...usuarioSemSenha } = novoUsuario;
  
  // Simular um pequeno atraso
  setTimeout(() => {
    res.status(201).json(usuarioSemSenha);
  }, 300);
});

app.patch('/usuarios/:id', autenticarToken, verificarAutorizacao('usuarios'), (req, res) => {
  const { id } = req.params;
  const { nome, email, grupos } = req.body;
  
  // Em um ambiente real, atualizaríamos no PostgreSQL
  // Exemplo: await pool.query('UPDATE usuarios SET nome = $1, email = $2, grupos = $3 WHERE id = $4 RETURNING *', [nome, email, grupos, id]);
  
  const usuarioIndex = usuariosSimulados.findIndex(u => u.id === id);
  
  if (usuarioIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const usuarioAtualizado = {
    ...usuariosSimulados[usuarioIndex],
    ...(nome && { nome }),
    ...(email && { email }),
    ...(grupos && { grupos })
  };
  
  usuariosSimulados[usuarioIndex] = usuarioAtualizado;
  
  // Remover senha antes de enviar
  const { senha, ...usuarioSemSenha } = usuarioAtualizado;
  
  // Simular um pequeno atraso
  setTimeout(() => {
    res.json(usuarioSemSenha);
  }, 300);
});

app.delete('/usuarios/:id', autenticarToken, verificarAutorizacao('usuarios'), (req, res) => {
  const { id } = req.params;
  
  // Em um ambiente real, removeríamos do PostgreSQL
  // Exemplo: await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
  
  const usuarioIndex = usuariosSimulados.findIndex(u => u.id === id);
  
  if (usuarioIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  usuariosSimulados.splice(usuarioIndex, 1);
  
  // Simular um pequeno atraso
  setTimeout(() => {
    res.status(204).end();
  }, 300);
});

// Rotas para gerenciamento de grupos (protegidas)
app.get('/grupos', autenticarToken, verificarAutorizacao('grupos'), (req, res) => {
  // Em um ambiente real, buscaríamos do PostgreSQL
  // Exemplo: const result = await pool.query('SELECT * FROM grupos');
  
  // Simular um pequeno atraso para demonstrar o estado de carregamento
  setTimeout(() => {
    res.json(gruposSimulados);
  }, 500);
});

app.post('/grupos', autenticarToken, verificarAutorizacao('grupos'), (req, res) => {
  const { nome, telasPermitidas } = req.body;
  
  // Validar dados
  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }
  
  // Em um ambiente real, inseriríamos no PostgreSQL
  // Exemplo: const result = await pool.query('INSERT INTO grupos (nome, telas_permitidas) VALUES ($1, $2) RETURNING *', [nome, telasPermitidas]);
  
  const novoGrupo = {
    id: uuidv4(),
    nome,
    telasPermitidas: telasPermitidas || []
  };
  
  gruposSimulados.push(novoGrupo);
  
  // Simular um pequeno atraso
  setTimeout(() => {
    res.status(201).json(novoGrupo);
  }, 300);
});

app.patch('/grupos/:id', autenticarToken, verificarAutorizacao('grupos'), (req, res) => {
  const { id } = req.params;
  const { nome, telasPermitidas } = req.body;
  
  // Em um ambiente real, atualizaríamos no PostgreSQL
  // Exemplo: await pool.query('UPDATE grupos SET nome = $1, telas_permitidas = $2 WHERE id = $3 RETURNING *', [nome, telasPermitidas, id]);
  
  const grupoIndex = gruposSimulados.findIndex(g => g.id === id);
  
  if (grupoIndex === -1) {
    return res.status(404).json({ error: 'Grupo não encontrado' });
  }
  
  const grupoAtualizado = {
    ...gruposSimulados[grupoIndex],
    ...(nome && { nome }),
    ...(telasPermitidas && { telasPermitidas })
  };
  
  gruposSimulados[grupoIndex] = grupoAtualizado;
  
  // Simular um pequeno atraso
  setTimeout(() => {
 
(Content truncated due to size limit. Use line ranges to read in chunks)