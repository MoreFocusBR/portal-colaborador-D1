import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import dashboardRouter from './routes/dashboard';

// Extender a interface Request para incluir a propriedade usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "1234567890";

// Tipagem para o usuário decodificado do token
interface UsuarioToken extends JwtPayload {
  id: string;
  email: string;
  grupos?: string[];
}

// Middleware
app.use(
  cors({
    origin: "*", // URL do seu frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Permite receber requisições com Referer de qualquer origem (APENAS PARA DEV)
app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade"); // Ou 'origin'
  next();
});

app.use(express.json());

// Integrar rotas do dashboard
app.use('/dashboard', dashboardRouter);

// Configuração da conexão com o PostgreSQL
// Nota: Em um ambiente de produção, estas credenciais viriam de variáveis de ambiente
const connectionString =
  "postgres://d1_orquestrador_db_user:m0rolZgKrck23Yd1p7rS72euVOtqxdI7@200.80.111.222:10066/d1_orquestrador_db";

// Criar pool de conexões
const pool = new Pool({
  connectionString,
});

// Testar conexão com o banco
pool.query("SELECT NOW()", (err: Error | null, res: any) => {
  if (err) {
    console.error("Erro ao conectar ao PostgreSQL:", err);
  } else {
    console.log("Conexão com PostgreSQL estabelecida com sucesso");
  }
});


// Simulação de dados para mensagens Email
const mensagensEmailSimuladas = [
  {
    id: "1",
    status: "Ativo",
    mensagem:
      "Prezado(a) {{primeiroNome}},\n\nSeu pedido {{numeroPedido}} foi confirmado e está em processamento.\n\nAtenciosamente,\nEquipe de Suporte",
    ativo: true,
  },
  {
    id: "2",
    status: "Inativo",
    mensagem:
      "Prezado(a) {{primeiroNome}},\n\nInformamos que seu pedido {{numeroPedido}} foi enviado e chegará em breve.\n\nAtenciosamente,\nEquipe de Logística",
    ativo: false,
  },
  {
    id: "3",
    status: "Pendente",
    mensagem:
      "Prezado(a) {{primeiroNome}},\n\nSeu pagamento de R$ {{valorPagamento}} foi confirmado.\n\nAtenciosamente,\nEquipe Financeira",
    ativo: true,
  },
];

// Simulação de dados para usuários
const usuariosSimulados = [
  {
    id: "1",
    nome: "Administrador",
    email: "admin@exemplo.com",
    senha: "admin123", // Em produção, seria um hash
    grupos: ["1"],
    ultimaAtividade: "2025-04-24T15:30:00Z",
  },
  {
    id: "2",
    nome: "Operador Financeiro",
    email: "financeiro@exemplo.com",
    senha: "financeiro123", // Em produção, seria um hash
    grupos: ["2"],
    ultimaAtividade: "2025-04-23T10:15:00Z",
  },
  {
    id: "3",
    nome: "Atendente",
    email: "atendimento@exemplo.com",
    senha: "atendimento123", // Em produção, seria um hash
    grupos: ["3"],
    ultimaAtividade: "2025-04-22T14:45:00Z",
  },
];

// Simulação de dados para grupos
const gruposSimulados = [
  {
    id: "1",
    nome: "Administradores",
    telasPermitidas: [
      "transacoes",
      "mensagens-whatsapp",
      "mensagens-email",
      "usuarios",
      "grupos",
      "vendas",
    ],
  },
  {
    id: "2",
    nome: "Financeiro",
    telasPermitidas: ["transacoes", "vendas"],
  },
  {
    id: "3",
    nome: "Atendimento",
    telasPermitidas: ["mensagens-whatsapp", "mensagens-email"],
  },
];

// Simulação de dados para vendas
const vendasSimuladas = [
  {
    id: "1",
    numero: "V-2025-001",
    data: "2025-04-20T10:30:00Z",
    status: "Financeiro Validado",
    nomeCliente: "João Silva",
    valorTotal: 1500.0,
    totalItens: 3,
  },
  {
    id: "2",
    numero: "V-2025-002",
    data: "2025-04-21T14:15:00Z",
    status: "A Enviar",
    nomeCliente: "Maria Oliveira",
    valorTotal: 750.5,
    totalItens: 2,
  },
  {
    id: "3",
    numero: "V-2025-003",
    data: "2025-04-22T09:45:00Z",
    status: "Financeiro Validado",
    nomeCliente: "Carlos Santos",
    valorTotal: 2300.75,
    totalItens: 5,
  },
  {
    id: "4",
    numero: "V-2025-004",
    data: "2025-04-23T16:20:00Z",
    status: "Aguardando Estoque",
    nomeCliente: "Ana Pereira",
    valorTotal: 450.0,
    totalItens: 1,
  },
  {
    id: "5",
    numero: "V-2025-005",
    data: "2025-04-24T11:10:00Z",
    status: "Financeiro Validado",
    nomeCliente: "Pedro Souza",
    valorTotal: 1200.25,
    totalItens: 4,
  },
];

// Middleware de autenticação
const autenticarToken = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Token não fornecido ou formato inválido" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Token inválido", details: err.message });
    }

    // Verificação de tipo segura
    if (isUsuarioToken(decoded)) {
      req.usuario = decoded; // Agora TypeScript reconhece esta propriedade
      return next();
    }

    return res.status(403).json({ error: "Estrutura do token inválida" });
  });
};

// Função de tipo guard (opcional mas recomendado)
function isUsuarioToken(decoded: any): decoded is UsuarioToken {
  return decoded && typeof decoded === "object" && "id" in decoded;
}

// Middleware de autorização
const verificarAutorizacao = (telaId: string) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const usuario = req.usuario;
    if (!usuario) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    const gruposDoUsuario = usuario.grupos || [];
    let autorizado = false;

    try {
      // Buscar todos os grupos do usuário no banco
      const result = await pool.query(
        'SELECT telas_permitidas FROM grupos WHERE id = ANY($1::uuid[])',
        [gruposDoUsuario]
      );
      // Verificar se alguma permissão bate com a tela
      for (const row of result.rows) {
        if ((row.telas_permitidas || []).includes(telaId)) {
          autorizado = true;
          break;
        }
      }
      if (!autorizado) {
        return res.status(403).json({ error: "Acesso negado a este recurso" });
      }
      next();
    } catch (error) {
      console.error("Erro ao verificar autorização:", error);
      return res.status(500).json({ error: "Erro ao verificar autorização" });
    }
  };
};

// Rota de autenticação
app.post("/auth/login", async (req, res) => {
  const { email, senha } = req.body;

  // Validar dados
  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  try {
    // Buscar usuário pelo e-mail no banco de dados
    const result = await pool.query(
      'SELECT id, nome, email, senha, grupos, ultima_atividade FROM usuarios WHERE email = $1',
      [email]
    );
    const usuario = result.rows[0];

    // Verificar se usuário existe e se a senha confere
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        grupos: usuario.grupos,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Atualizar última atividade
    await pool.query(
      'UPDATE usuarios SET ultima_atividade = $1 WHERE id = $2',
      [new Date().toISOString(), usuario.id]
    );

    // Remover senha antes de enviar
    const { senha: _, ...usuarioSemSenha } = usuario;

    // Simular um pequeno atraso
    setTimeout(() => {
      res.json({
        token,
        usuario: usuarioSemSenha,
      });
    }, 500);
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error);
    res.status(500).json({ error: "Erro ao autenticar usuário" });
  }
});

// Rota para obter transações financeiras (protegida)
app.get(
  "/interExtratoD1",
  autenticarToken,
  verificarAutorizacao("transacoes"),
  async (req, res) => {
  
// Chama a API externa
      const response = await fetch('http://200.80.111.222:10065/interExtratoD1', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

    
      res.json(response);
    
  }
);

// Rota para obter mensagens WhatsApp (protegida)
app.get(
  "/mensagens-whatsapp",
  autenticarToken,
  verificarAutorizacao("mensagens-whatsapp"),
  async (req, res) => {
    // Em um ambiente real, buscaríamos do PostgreSQL
    // Exemplo: const result = await pool.query('SELECT * FROM mensagens_whatsapp');
    //const { ativo, texto,  } = req.query;
    try {
      let mensagensWhats = await pool.query(
        'SELECT * FROM "RastreioStatusWhats"'
      );
      let mensagensWhatsFiltradas = [...mensagensWhats.rows];

      res.json(mensagensWhatsFiltradas);
    } catch (error) {
      console.error("Erro ao buscar mensagens WhatsApp:", error);
      return res
        .status(500)
        .json({ error: "Erro ao buscar mensagens WhatsApp" });
    }
  }
);

// Rota para atualizar status de mensagem WhatsApp (protegida)
app.patch(
  "/mensagens-whatsapp/:id",
  autenticarToken,
  verificarAutorizacao("mensagens-whatsapp"),
  async (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body;

    let mensagensWhats = await pool.query('SELECT * FROM "RastreioStatusWhats"');
    let mensagensWhatsFiltradas = [...mensagensWhats.rows];

    // Em um ambiente real, atualizaríamos no PostgreSQL
    // Exemplo: await pool.query('UPDATE mensagens_whatsapp SET ativo = $1 WHERE id = $2', [ativo, id]);

    const mensagemIndex = mensagensWhatsFiltradas.findIndex((m) => m.id === id);

    if (mensagemIndex === -1) {
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }

    mensagensWhatsFiltradas[mensagemIndex].ativo = ativo;

    res.json(mensagensWhatsFiltradas[mensagemIndex]);
  }
);

// Rota para obter mensagens Email (protegida)
app.get(
  "/mensagens-email",
  autenticarToken,
  verificarAutorizacao("mensagens-email"),
  (req, res) => {
    // Em um ambiente real, buscaríamos do PostgreSQL
    // Exemplo: const result = await pool.query('SELECT * FROM mensagens_email');

    // Simular um pequeno atraso para demonstrar o estado de carregamento
    setTimeout(() => {
      res.json(mensagensEmailSimuladas);
    }, 500);
  }
);

// Rota para atualizar status de mensagem Email (protegida)
app.patch(
  "/mensagens-email/:id",
  autenticarToken,
  verificarAutorizacao("mensagens-email"),
  (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body;

    // Em um ambiente real, atualizaríamos no PostgreSQL
    // Exemplo: await pool.query('UPDATE mensagens_email SET ativo = $1 WHERE id = $2', [ativo, id]);

    const mensagemIndex = mensagensEmailSimuladas.findIndex((m) => m.id === id);

    if (mensagemIndex === -1) {
      return res.status(404).json({ error: "Mensagem não encontrada" });
    }

    mensagensEmailSimuladas[mensagemIndex].ativo = ativo;

    // Simular um pequeno atraso
    setTimeout(() => {
      res.json(mensagensEmailSimuladas[mensagemIndex]);
    }, 300);
  }
);

// Rotas para gerenciamento de usuários (protegidas)
app.get(
  "/usuarios",
  autenticarToken,
  verificarAutorizacao("usuarios"),
  async (req, res) => {
    try {
      const result = await pool.query('SELECT id, nome, email, grupos, ultima_atividade FROM usuarios');
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  }
);

app.post(
  "/usuarios",
  autenticarToken,
  verificarAutorizacao("usuarios"),
  async (req, res) => {
    const { nome, email, grupos } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios" });
    }

    try {
      const result = await pool.query(
        'INSERT INTO usuarios (id, nome, email, senha, grupos, ultima_atividade) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, email, grupos, ultima_atividade',
        [uuidv4(), nome, email, 'senha123', grupos || [], new Date().toISOString()]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }
);

app.patch(
  "/usuarios/:id",
  autenticarToken,
  verificarAutorizacao("usuarios"),
  async (req, res) => {
    const { id } = req.params;
    const { nome, email, grupos } = req.body;

    try {
      const result = await pool.query(
        'UPDATE usuarios SET nome = COALESCE($1, nome), email = COALESCE($2, email), grupos = COALESCE($3, grupos) WHERE id = $4 RETURNING id, nome, email, grupos, ultima_atividade',
        [nome, email, grupos, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  }
);

app.delete(
  "/usuarios/:id",
  autenticarToken,
  verificarAutorizacao("usuarios"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  }
);

// Endpoint para alteração de senha do usuário autenticado
app.patch(
  "/usuarios/:id/senha",
  autenticarToken,
  async (req, res) => {
    const { id } = req.params;
    const { senha } = req.body;
    // Só permite alterar a própria senha
    if (!req.usuario || req.usuario.id !== id) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    if (!senha || senha.length < 4) {
      return res.status(400).json({ error: "Senha inválida" });
    }
    try {
      await pool.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [senha, id]);
      res.status(204).end();
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      res.status(500).json({ error: "Erro ao alterar senha" });
    }
  }
);

// Rotas para gerenciamento de grupos (protegidas)
app.get(
  "/grupos",
  autenticarToken,
  async (req, res) => {
    try {
      let query = 'SELECT * FROM grupos';
      let params: any[] = [];
      if (req.query.ids) {
        const ids = (req.query.ids as string).split(',');
        query += ' WHERE id = ANY($1::uuid[])';
        params = [ids];
      }
      const result = await pool.query(query, params);
      // Mapear para camelCase
      const grupos = result.rows.map(g => ({
        ...g,
        telasPermitidas: g.telas_permitidas || [],
      }));
      res.json(grupos);
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      res.status(500).json({ error: "Erro ao buscar grupos" });
    }
  }
);

app.post(
  "/grupos",
  autenticarToken,
  verificarAutorizacao("grupos"),
  async (req, res) => {
    const { nome, telasPermitidas } = req.body;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    try {
      const result = await pool.query(
        'INSERT INTO grupos (id, nome, telas_permitidas) VALUES ($1, $2, $3) RETURNING *',
        [uuidv4(), nome, telasPermitidas || []]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      res.status(500).json({ error: "Erro ao criar grupo" });
    }
  }
);

app.patch(
  "/grupos/:id",
  autenticarToken,
  verificarAutorizacao("grupos"),
  async (req, res) => {
    const { id } = req.params;
    const { nome, telasPermitidas } = req.body;

    try {
      const result = await pool.query(
        'UPDATE grupos SET nome = COALESCE($1, nome), telas_permitidas = COALESCE($2, telas_permitidas) WHERE id = $3 RETURNING *',
        [nome, telasPermitidas, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Grupo não encontrado" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      res.status(500).json({ error: "Erro ao atualizar grupo" });
    }
  }
);

app.delete(
  "/grupos/:id",
  autenticarToken,
  verificarAutorizacao("grupos"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query('DELETE FROM grupos WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Grupo não encontrado" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Erro ao deletar grupo:", error);
      res.status(500).json({ error: "Erro ao deletar grupo" });
    }
  }
);

// Rotas para gerenciamento de vendas (protegidas)
app.get(
  "/vendas",
  autenticarToken,
  verificarAutorizacao("vendas"),
  (req, res) => {
    const { periodo, status, numeroVenda } = req.query;

    let vendasFiltradas = [...vendasSimuladas];

    // Aplicar filtros se fornecidos
    if (periodo) {
      const diasAtras = parseInt(periodo as string);
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - diasAtras);

      vendasFiltradas = vendasFiltradas.filter(
        (v) => new Date(v.data) >= dataLimite
      );
    }

    if (status) {
      vendasFiltradas = vendasFiltradas.filter((v) => v.status === status);
    }

    if (numeroVenda) {
      vendasFiltradas = vendasFiltradas.filter((v) =>
        v.numero.includes(numeroVenda as string)
      );
    }

    // Simular um pequeno atraso para demonstrar o estado de carregamento
    setTimeout(() => {
      res.json(vendasFiltradas);
    }, 500);
  }
);

app.patch(
  "/vendas/:id/status",
  autenticarToken,
  verificarAutorizacao("vendas"),
  (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Em um ambiente real, atualizaríamos no PostgreSQL
    // Exemplo: await pool.query('UPDATE vendas SET status = $1 WHERE id = $2 RETURNING *', [status, id]);

    const vendaIndex = vendasSimuladas.findIndex((v) => v.id === id);

    if (vendaIndex === -1) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    // Verificar se o status atual é "Financeiro Validado"
    if (vendasSimuladas[vendaIndex].status !== "Financeiro Validado") {
      return res
        .status(400)
        .json({
          error:
            'Apenas vendas com status "Financeiro Validado" podem ter o status alterado',
        });
    }

    vendasSimuladas[vendaIndex].status = status;

    // Simular um pequeno atraso
    setTimeout(() => {
      res.json(vendasSimuladas[vendaIndex]);
    }, 300);
  }
);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { pool };
export default app;
