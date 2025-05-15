import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Define a type for the file object if Express.Multer.File is not sufficient
// interface CustomFile extends Express.Multer.File {}

// Configuração do armazenamento para o multer
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, "uploads/imagens/"); // Diretório onde as imagens serão salvas
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    // Define o nome do arquivo como timestamp atual + nome original
    // Isso ajuda a evitar conflitos de nome de arquivo
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

// Filtro para aceitar apenas determinados tipos de imagem
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Erro: Tipo de arquivo não suportado! Apenas imagens (jpeg, jpg, png, gif) são permitidas."));
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limite de 5MB para o tamanho do arquivo
  },
  fileFilter: fileFilter,
});

export default upload;

