import { Request, Response } from "express";
import { Pool } from "pg";


// Configuração da conexão com o PostgreSQL
const connectionString =
  process.env.DATABASE_URL || "postgres://d1_orquestrador_db_user:m0rolZgKrck23Yd1p7rS72euVOtqxdI7@200.80.111.222:10066/d1_orquestrador_db";

// Criar pool de conexões
const pool = new Pool({
  connectionString,
});
interface Evento {
  id?: number; // Assuming id is a number, adjust if it's UUID
  titulo: string;
  data: string; // Or Date
  hora: string; // Or Date
  descricao?: string;
  imagem_url?: string;
  google_meet_link?: string;
  criado_em?: Date;
  atualizado_em?: Date;
}

// Extend Express Request type to include file property from multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

// Criar um novo evento
const criarEvento = async (req: RequestWithFile, res: Response) => {
  const { titulo, data, hora, descricao, googleMeetLink } = req.body;
  const imagemUrl = req.file ? `/uploads/imagens/${req.file.filename}` : null;

  if (!titulo || !data || !hora) {
    return res.status(400).json({ message: "Título, data e hora são obrigatórios." });
  }

  try {
    const result = await pool.query<Evento>(
      "INSERT INTO eventos (titulo, data, hora, descricao, imagem_url, google_meet_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [titulo, data, hora, descricao, imagemUrl, googleMeetLink]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    res.status(500).json({ message: "Erro interno do servidor ao criar evento." });
  }
};

// Listar todos os eventos
const listarEventos = async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Evento>("SELECT id, titulo, data, hora, descricao, imagem_url, google_meet_link FROM eventos ORDER BY criado_em DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao listar eventos:", error);
    res.status(500).json({ message: "Erro interno do servidor ao listar eventos." });
  }
};

// Obter um evento específico
const obterEvento = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Evento>("SELECT id, titulo, data, hora, descricao, imagem_url, google_meet_link FROM eventos WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Evento não encontrado." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao obter evento:", error);
    res.status(500).json({ message: "Erro interno do servidor ao obter evento." });
  }
};

// Atualizar um evento existente
const atualizarEvento = async (req: RequestWithFile, res: Response) => {
  const { id } = req.params;
  const { titulo, data, hora, descricao, googleMeetLink } = req.body;
  let imagemUrl: string | null | undefined;

  try {
    const eventoExistenteResult = await pool.query<{ imagem_url?: string }>("SELECT imagem_url FROM eventos WHERE id = $1", [id]);
    if (eventoExistenteResult.rows.length === 0) {
      return res.status(404).json({ message: "Evento não encontrado para atualização." });
    }

    const eventoExistente = eventoExistenteResult.rows[0];

    if (req.file) {
      imagemUrl = `/uploads/imagens/${req.file.filename}`;
    } else {
      // Se imagemUrl for passada no corpo, usa esse valor (pode ser null para remover)
      // Senão, mantém a imagem_url existente.
      imagemUrl = req.body.imagemUrl !== undefined ? req.body.imagemUrl : eventoExistente.imagem_url;
    }

    const result = await pool.query<Evento>(
      "UPDATE eventos SET titulo = $1, data = $2, hora = $3, descricao = $4, imagem_url = $5, google_meet_link = $6, atualizado_em = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [titulo, data, hora, descricao, imagemUrl, googleMeetLink, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Evento não encontrado após tentativa de atualização." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    res.status(500).json({ message: "Erro interno do servidor ao atualizar evento." });
  }
};

// Deletar um evento existente
const deletarEvento = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Evento>("DELETE FROM eventos WHERE id = $1 RETURNING *", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Evento não encontrado para deleção." });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar evento:", error);
    res.status(500).json({ message: "Erro interno do servidor ao deletar evento." });
  }
};

export default {
  criarEvento,
  listarEventos,
  obterEvento,
  atualizarEvento,
  deletarEvento,
};

