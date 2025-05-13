import { create } from 'zustand';

// Definição dos tipos para as transações financeiras conforme a API externa
export interface DetalhesTransacao {
  txId: string;
  nomePagador: string;
  descricaoPix: string;
  cpfCnpjPagador: string;
  nomeEmpresaPagador: string;
  tipoDetalhe: string;
  endToEndId: string;
  chavePixRecebedor: string;
}

export interface Transacao {
  idTransacao: string;
  dataInclusao: string;
  dataTransacao: string;
  tipoTransacao: string; // PIX, Transferência, Boleto, etc.
  tipoOperacao: string;  // C (Crédito), D (Débito)
  valor: string; // A API retorna como string, converter para número se necessário na UI
  titulo: string;
  descricao: string;
  numeroDocumento: string;
  detalhes?: DetalhesTransacao; // Opcional, pois nem toda transação pode ter
}

interface TransacoesState {
  transacoes: Transacao[];
  loading: boolean;
  error: string | null;
  filtros: {
    dataInicial: string; // Manter como string para o payload da API
    dataFinal: string;   // Manter como string para o payload da API
    tipoTransacao: string;
    docPagador: string;
    pagador: string;
    valor: string;
  };
  totalPaginas: number;
  totalElementos: number;
  
  fetchTransacoes: (payload?: any) => Promise<void>;
  setFiltros: (filtros: Partial<TransacoesState['filtros']>) => void;
}

const useTransacoesStore = create<TransacoesState>((set, get) => ({
  transacoes: [],
  loading: false,
  error: null,
  filtros: {
    dataInicial: '2025-01-12', // Valor padrão conforme solicitado
    dataFinal: '2025-03-12',   // Valor padrão conforme solicitado
    tipoTransacao: '',
    docPagador: '', 
    pagador: '',
    valor: '',
  },
  totalPaginas: 0,
  totalElementos: 0,
  
  fetchTransacoes: async (payloadRequest) => {
    const { filtros } = get();
    
    // Payload padrão conforme solicitado
    const defaultPayload = {
      dataInicio: filtros.dataInicial, // Usar filtros do store ou valores fixos
      dataFim: filtros.dataFinal,     // Usar filtros do store ou valores fixos
      tokenExtrato: "klajdfJHGS5%$#$99",
      dias: 1 // Este campo parece fixo, mas pode ser ajustado se necessário
    };

    const payload = payloadRequest || defaultPayload;

    try {
      set({ loading: true, error: null });
      
      const response = await fetch('http://200.80.111.222:10065/interExtratoD1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ao buscar transações: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      
      if (data && data.resExtrato && Array.isArray(data.resExtrato.transacoes)) {
        set({
          transacoes: data.resExtrato.transacoes,
          totalPaginas: data.resExtrato.totalPaginas || 0,
          totalElementos: data.resExtrato.totalElementos || 0,
          loading: false,
        });
      } else {
        throw new Error('Formato de resposta inesperado da API');
      }

    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar transações',
        loading: false,
        transacoes: [], // Limpar transações em caso de erro
        totalPaginas: 0,
        totalElementos: 0,
      });
    }
  },
  
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

