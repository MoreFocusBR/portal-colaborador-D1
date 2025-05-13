import { create } from 'zustand';

// Definição dos tipos para as transações financeiras
export interface Transacao {
  id: string;
  dataHora: string;
  tipoTransacao: 'PIX' | 'Transferência' | 'Boleto';
  tipoOperacao: 'C' | 'D';
  valor: number;
  pagador: string;
  documentoPagador: string;
}

const varLocalStorage = JSON.parse(localStorage["auth-storage"]);
const token = varLocalStorage.state.token;

interface TransacoesState {
  transacoes: Transacao[];
  loading: boolean;
  error: string | null;
  filtros: {
    dataInicial: Date | null;
    dataFinal: Date | null;
    tipoTransacao: string;
  };
  
  // Ações
  fetchTransacoes: () => Promise<void>;
  setFiltros: (filtros: Partial<TransacoesState['filtros']>) => void;
}

// Criação do store com Zustand
const useTransacoesStore = create<TransacoesState>((set, get) => ({
  transacoes: [],
  loading: false,
  error: null,
  filtros: {
    dataInicial: null,
    dataFinal: null,
    tipoTransacao: '',
  },
  
  // Função para buscar transações da API
  fetchTransacoes: async () => {
    const { filtros } = get();
    
    try {
      set({ loading: true, error: null });
      
      // Construir parâmetros de consulta baseados nos filtros
      const params = new URLSearchParams();
      
      if (filtros.dataInicial) {
        params.append('dataInicial', filtros.dataInicial.toISOString().split('T')[0]);
      }
      
      if (filtros.dataFinal) {
        params.append('dataFinal', filtros.dataFinal.toISOString().split('T')[0]);
      }
      
      if (filtros.tipoTransacao) {
        params.append('tipoTransacao', filtros.tipoTransacao);
      }
      
      // URL base da API
      const baseUrl = 'http://localhost:3001/interExtratoD1';
      const url = params.toString() ? `${baseUrl}` : baseUrl;
      
      // Fazer a requisição para a API
      const response = await fetch(url, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, 
  },
});
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar transações: ${response.status}`);
      }
      
      const data = await response.json();
      set({ transacoes: data, loading: false });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar transações', 
        loading: false 
      });
    }
  },
  
  // Função para atualizar filtros
  setFiltros: (novosFiltros) => {
    set((state) => ({
      filtros: {
        ...state.filtros,
        ...novosFiltros,
      }
    }));
  },
}));

export default useTransacoesStore;
