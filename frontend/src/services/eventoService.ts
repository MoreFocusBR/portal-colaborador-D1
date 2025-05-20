import { getAuthToken } from "../utils/auth"; // Para obter o token
const authToken = getAuthToken();
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'; // Adjust if your API is elsewhere

export interface Evento {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  descricao?: string;
  imagem_url?: string;
  google_meet_link?: string;
}

export const eventoService = {
  listarEventos: async (): Promise<Evento[]> => {
    const url = `${API_BASE_URL}/eventos`;
    const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  return await response.json();
  },
};
