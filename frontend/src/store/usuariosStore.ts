import { create } from "zustand";

// Definição dos tipos para usuários
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  grupos: string[];
  ultimaAtividade: string;
}

const varLocalStorage = JSON.parse(localStorage["auth-storage"]);
const token = varLocalStorage.state.token;

interface UsuariosState {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;

  // Ações
  fetchUsuarios: () => Promise<void>;
  adicionarUsuario: (usuario: Omit<Usuario, "id">) => Promise<void>;
  atualizarUsuario: (id: string, usuario: Partial<Usuario>) => Promise<void>;
  removerUsuario: (id: string) => Promise<void>;
}

// Criação do store com Zustand
const useUsuariosStore = create<UsuariosState>((set, get) => ({
  usuarios: [],
  loading: false,
  error: null,

  // Função para buscar usuários da API
  fetchUsuarios: async () => {
    try {
      set({ loading: true, error: null });

      // URL base da API
      const url = "http://localhost:3001/usuarios";

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar usuários: ${response.status}`);
      }

      const data = await response.json();
      set({ usuarios: data, loading: false });
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao buscar usuários",
        loading: false,
      });
    }
  },

  // Função para adicionar um novo usuário
  adicionarUsuario: async (usuario) => {
    try {
      set({ loading: true, error: null });

      // URL base da API
      const url = "http://localhost:3001/usuarios";

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        throw new Error(`Erro ao adicionar usuário: ${response.status}`);
      }

      const novoUsuario = await response.json();

      // Atualizar o estado local
      set((state) => ({
        usuarios: [...state.usuarios, novoUsuario],
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao adicionar usuário",
        loading: false,
      });
    }
  },

  // Função para atualizar um usuário existente
  atualizarUsuario: async (id, usuario) => {
    try {
      set({ loading: true, error: null });

      // URL para atualizar o usuário
      const url = `http://localhost:3001/usuarios/${id}`;

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar usuário: ${response.status}`);
      }

      const usuarioAtualizado = await response.json();

      // Atualizar o estado local
      set((state) => ({
        usuarios: state.usuarios.map((u) =>
          u.id === id ? { ...u, ...usuarioAtualizado } : u
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao atualizar usuário",
        loading: false,
      });
    }
  },

  // Função para remover um usuário
  removerUsuario: async (id) => {
    try {
      set({ loading: true, error: null });

      // URL para remover o usuário
      const url = `http://localhost:3001/usuarios/${id}`;

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao remover usuário: ${response.status}`);
      }

      // Atualizar o estado local
      set((state) => ({
        usuarios: state.usuarios.filter((u) => u.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao remover usuário",
        loading: false,
      });
    }
  },
}));

export default useUsuariosStore;
