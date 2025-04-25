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
      isAuthenticated: false,
      loading: false,
      error: null,
      
      // Função para realizar login
      login: async (email, senha) => {
        try {
          set({ loading: true, error: null });
          
          // URL para autenticação
          const url = 'http://localhost:3001/auth/login';
          
          // Fazer a requisição para a API
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
          });
          
          if (!response.ok) {
            throw new Error(`Erro ao realizar login: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Armazenar token e informações do usuário
          set({ 
            token: data.token,
            usuario: data.usuario,
            isAuthenticated: true,
            loading: false 
          });
        } catch (error) {
          console.error('Erro ao realizar login:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erro desconhecido ao realizar login', 
            loading: false,
            token: null,
            usuario: null,
            isAuthenticated: false
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
        const { usuario, isAuthenticated } = get();
        
        if (!isAuthenticated || !usuario) {
          return false;
        }
        
        // Verificar se o usuário pertence a algum grupo que tem permissão para a tela
        // Esta verificação depende da estrutura de dados do backend
        // Por enquanto, vamos simular uma verificação simples
        
        // Administradores têm acesso a todas as telas
        if (usuario.grupos.includes('1')) {
          return true;
        }
        
        // Financeiro tem acesso a transações e vendas
        if (usuario.grupos.includes('2') && (telaId === 'transacoes' || telaId === 'vendas')) {
          return true;
        }
        
        // Atendimento tem acesso a mensagens
        if (usuario.grupos.includes('3') && (telaId === 'mensagens-whatsapp' || telaId === 'mensagens-email')) {
          return true;
        }
        
        return false;
      }
    }),
    {
      name: 'auth-storage', // nome para o armazenamento no localStorage
      partialize: (state) => ({ 
        token: state.token, 
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated
      }), // armazenar apenas estas propriedades
    }
  )
);

export default useAuthStore;
