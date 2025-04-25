import { create } from 'zustand';

// Definição dos tipos para as mensagens WhatsApp
export interface MensagemWhatsApp {
  id: string;
  status: string;
  mensagem: string;
  ativo: boolean;
}

interface MensagensWhatsAppState {
  mensagens: MensagemWhatsApp[];
  loading: boolean;
  error: string | null;
  
  // Ações
  fetchMensagens: () => Promise<void>;
  toggleAtivoStatus: (id: string) => Promise<void>;
}

// Criação do store com Zustand
const useMensagensWhatsAppStore = create<MensagensWhatsAppState>((set, get) => ({
  mensagens: [],
  loading: false,
  error: null,
  
  // Função para buscar mensagens do banco de dados
  fetchMensagens: async () => {
    try {
      set({ loading: true, error: null });
      
      // URL base da API
      const url = 'http://localhost:3001/mensagens-whatsapp';
      
      // Fazer a requisição para a API
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar mensagens: ${response.status}`);
      }
      
      const data = await response.json();
      set({ mensagens: data, loading: false });
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar mensagens', 
        loading: false 
      });
    }
  },
  
  // Função para alternar o status ativo de uma mensagem
  toggleAtivoStatus: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      // Encontrar a mensagem atual
      const { mensagens } = get();
      const mensagem = mensagens.find(m => m.id === id);
      
      if (!mensagem) {
        throw new Error('Mensagem não encontrada');
      }
      
      // URL para atualizar a mensagem
      const url = `http://localhost:3001/mensagens-whatsapp/${id}`;
      
      // Fazer a requisição para atualizar o status
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ativo: !mensagem.ativo }),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao atualizar mensagem: ${response.status}`);
      }
      
      // Atualizar o estado local
      set({
        mensagens: mensagens.map(m => 
          m.id === id ? { ...m, ativo: !m.ativo } : m
        ),
        loading: false
      });
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar mensagem', 
        loading: false 
      });
    }
  },
}));

export default useMensagensWhatsAppStore;
