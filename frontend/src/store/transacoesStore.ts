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
  tipoTransacao: string;
  tipoOperacao: string;
  valor: string;
  titulo: string;
  descricao: string;
  numeroDocumento: string;
  detalhes?: DetalhesTransacao;
}

// Estado individual para cada empresa
export interface EmpresaState {
  transacoes: Transacao[];
  loading: boolean;
  error: string | null;
  filtros: {
    dataInicial: string;
    dataFinal: string;
    // Filtros locais do frontend, podem ser adicionados aqui se necessário
    // ou gerenciados na própria tela de transações
  };
  totalPaginas: number;
  totalElementos: number;
}

// Estado principal do store para múltiplas empresas
interface TransacoesMultiEmpresaState {
  empresas: {
    [empresaId: string]: EmpresaState | undefined; // EmpresaState pode ser undefined inicialmente
  };
  activeEmpresaId: string; // ID da empresa ativa (ex: 'D1', 'FORT', 'RDSPORTS')
  endpoints: {
    [empresaId: string]: string;
  };
  fetchTransacoes: (empresaId: string, payloadRequest?: any) => Promise<void>;
  setFiltros: (empresaId: string, novosFiltros: Partial<EmpresaState['filtros']>) => void;
  setActiveEmpresaId: (empresaId: string) => void;
  getEmpresaState: (empresaId: string) => EmpresaState; // Helper para obter estado com valores padrão
}

const initialFiltros = {
  dataInicial: '2024-08-01', 
  dataFinal: '2024-09-18',
};

const initialEmpresaState: EmpresaState = {
  transacoes: [],
  loading: false,
  error: null,
  filtros: initialFiltros,
  totalPaginas: 0,
  totalElementos: 0,
};

const useTransacoesStore = create<TransacoesMultiEmpresaState>((set, get) => ({
  empresas: {},
  activeEmpresaId: 'D1', // Empresa D1 como padrão inicial
  endpoints: {
    'D1': 'http://200.80.111.222:10065/interExtratoD1',
    'FORT': 'http://200.80.111.222:10065/interExtratoFort',
    'RDSPORTS': 'http://200.80.111.222:10065/interExtratoRDSPORTS',
  },

  getEmpresaState: (empresaId: string) => {
    const state = get().empresas[empresaId];
    return state ? state : { ...initialEmpresaState }; // Retorna estado inicial se não existir
  },

  fetchTransacoes: async (empresaId, payloadRequest) => {
    const currentEmpresaState = get().getEmpresaState(empresaId);
    const endpoint = get().endpoints[empresaId];

    if (!endpoint) {
      const errorMsg = `Endpoint não definido para a empresa: ${empresaId}`;
      console.error(errorMsg);
      set(state => ({
        empresas: {
          ...state.empresas,
          [empresaId]: {
            ...currentEmpresaState,
            error: errorMsg,
            loading: false,
          },
        },
      }));
      return;
    }

    const defaultPayload = {
      dataInicio: currentEmpresaState.filtros.dataInicial,
      dataFim: currentEmpresaState.filtros.dataFinal,
      tokenExtrato: "klajdfJHGS5%$#$99",
      dias: 1,
    };

    const payload = payloadRequest || defaultPayload;

    try {
      set(state => ({
        empresas: {
          ...state.empresas,
          [empresaId]: { ...currentEmpresaState, loading: true, error: null },
        },
      }));
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erro ao buscar transações (${empresaId}): ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      
      if (data && data.resExtrato && Array.isArray(data.resExtrato.transacoes)) {
        set(state => ({
          empresas: {
            ...state.empresas,
            [empresaId]: {
              ...currentEmpresaState,
              transacoes: data.resExtrato.transacoes,
              totalPaginas: data.resExtrato.totalPaginas || 0,
              totalElementos: data.resExtrato.totalElementos || 0,
              loading: false,
            },
          },
        }));
      } else {
        throw new Error(`Formato de resposta inesperado da API (${empresaId})`);
      }

    } catch (error) {
      console.error(`Erro ao buscar transações (${empresaId}):`, error);
      const errorMsg = error instanceof Error ? error.message : `Erro desconhecido ao buscar transações (${empresaId})`;
      set(state => ({
        empresas: {
          ...state.empresas,
          [empresaId]: {
            ...currentEmpresaState,
            error: errorMsg,
            loading: false,
            transacoes: [],
            totalPaginas: 0,
            totalElementos: 0,
          },
        },
      }));
    }
  },
  
  setFiltros: (empresaId, novosFiltros) => {
    set((state) => {
      const currentEmpresaState = state.getEmpresaState(empresaId);
      return {
        empresas: {
          ...state.empresas,
          [empresaId]: {
            ...currentEmpresaState,
            filtros: {
              ...currentEmpresaState.filtros,
              ...novosFiltros,
            },
          },
        },
      };
    });
  },

  setActiveEmpresaId: (empresaId) => {
    set({ activeEmpresaId: empresaId });
    // Opcional: buscar dados da nova empresa ativa se não tiverem sido carregados ainda
    const currentEmpresaState = get().getEmpresaState(empresaId);
    if (currentEmpresaState.transacoes.length === 0 && !currentEmpresaState.loading) {
       get().fetchTransacoes(empresaId);
     }
  },
}));

export default useTransacoesStore;

