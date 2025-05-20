import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definição dos tipos para autenticação
interface Usuario {
  id: string;
  nome: string;
  email: string;
  grupos: string[];
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  permissoes: string[]; // permissões reais das telas
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Ações
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  verificarAutorizacao: (telaId: string) => boolean;
}

// Criação do store com Zustand e persistência
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      permissoes: [],
      isAuthenticated: false,
      loading: false,
      error: null,
      
      // Função para realizar login
      login: async (email, senha) => {
        set({ loading: true, error: null });
        try {
          // Login na API
          const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erro ao fazer login');
          }
          const data = await response.json();
          // Buscar permissões reais dos grupos do usuário
          let permissoes: string[] = [];
          if (data.usuario && Array.isArray(data.usuario.grupos) && data.usuario.grupos.length > 0) {
            const gruposResp = await fetch(`http://localhost:3001/api/grupos?ids=${data.usuario.grupos.join(',')}`, {
              headers: { 'Authorization': `Bearer ${data.token}` }
            });
            if (gruposResp.ok) {
              const grupos = await gruposResp.json();
              // Unir todas as telasPermitidas dos grupos
              permissoes = grupos.reduce((acc: string[], grupo: any) => {
                if (Array.isArray(grupo.telasPermitidas)) {
                  return acc.concat(grupo.telasPermitidas);
                }
                return acc;
              }, []);
              // Remover duplicatas
              permissoes = Array.from(new Set(permissoes));
            }
          }
          set({
            token: data.token,
            usuario: data.usuario,
            permissoes,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (error: any) {
          set({
            error: error.message || 'Erro desconhecido ao fazer login',
            loading: false,
            isAuthenticated: false,
            usuario: null,
            permissoes: [],
            token: null
          });
        }
      },
      
      // Função para realizar logout
      logout: () => {
        set({ 
          token: null,
          usuario: null,
          isAuthenticated: false,
          error: null
        });
      },
      
      // Função para verificar se o usuário tem autorização para acessar uma tela
      verificarAutorizacao: (telaId) => {
        const { permissoes, isAuthenticated } = get();
        if (!isAuthenticated) return false;
        return permissoes.includes(telaId);
      }
    }),
    {
      name: 'auth-storage', // nome para o armazenamento no localStorage
      partialize: (state) => ({ 
        token: state.token, 
        usuario: state.usuario,
        permissoes: state.permissoes,
        isAuthenticated: state.isAuthenticated
      }), // armazenar apenas estas propriedades
    }
  )
);

export default useAuthStore;
