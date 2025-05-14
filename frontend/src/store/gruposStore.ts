import { create } from "zustand";
import { getAuthToken } from "../utils/auth";

// Definição dos tipos para grupos
export interface Grupo {
  id: string;
  nome: string;
  telasPermitidas: string[];
}

const authStorage = localStorage.getItem("auth-storage");
const varLocalStorage = authStorage ? JSON.parse(authStorage) : null;
const token = getAuthToken();

interface GruposState {
  grupos: Grupo[];
  loading: boolean;
  error: string | null;

  // Ações
  fetchGrupos: () => Promise<void>;
  adicionarGrupo: (grupo: Omit<Grupo, "id">) => Promise<void>;
  atualizarGrupo: (id: string, grupo: Partial<Grupo>) => Promise<void>;
  removerGrupo: (id: string) => Promise<void>;
}

// Criação do store com Zustand
const useGruposStore = create<GruposState>((set, get) => ({
  grupos: [],
  loading: false,
  error: null,

  // Função para buscar grupos da API
  fetchGrupos: async () => {
    try {
      set({ loading: true, error: null });

      // URL base da API
      const url = "http://localhost:3001/grupos";

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar grupos: ${response.status}`);
      }

      const data = await response.json();
      set({ grupos: data, loading: false });
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao buscar grupos",
        loading: false,
      });
    }
  },

  // Função para adicionar um novo grupo
  adicionarGrupo: async (grupo) => {
    try {
      set({ loading: true, error: null });

      // URL base da API
      const url = "http://localhost:3001/grupos";

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(grupo),
      });

      if (!response.ok) {
        throw new Error(`Erro ao adicionar grupo: ${response.status}`);
      }

      const novoGrupo = await response.json();

      // Atualizar o estado local
      set((state) => ({
        grupos: [...state.grupos, novoGrupo],
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao adicionar grupo:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao adicionar grupo",
        loading: false,
      });
    }
  },

  // Função para atualizar um grupo existente
  atualizarGrupo: async (id, grupo) => {
    try {
      set({ loading: true, error: null });

      // URL para atualizar o grupo
      const url = `http://localhost:3001/grupos/${id}`;

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(grupo),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar grupo: ${response.status}`);
      }

      const grupoAtualizado = await response.json();
      // Garantir camelCase no frontend
      const grupoCamelCase = {
        ...grupoAtualizado,
        telasPermitidas: grupoAtualizado.telasPermitidas || grupoAtualizado.telas_permitidas || [],
      };

      // Atualizar o estado local
      set((state) => ({
        grupos: state.grupos.map((g) =>
          g.id === id ? { ...g, ...grupoCamelCase } : g
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao atualizar grupo",
        loading: false,
      });
    }
  },

  // Função para remover um grupo
  removerGrupo: async (id) => {
    try {
      set({ loading: true, error: null });

      // URL para remover o grupo
      const url = `http://localhost:3001/grupos/${id}`;

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao remover grupo: ${response.status}`);
      }

      // Atualizar o estado local
      set((state) => ({
        grupos: state.grupos.filter((g) => g.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao remover grupo:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao remover grupo",
        loading: false,
      });
    }
  },
}));

export default useGruposStore;
