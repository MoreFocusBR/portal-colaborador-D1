import { create } from "zustand";
import { getAuthToken } from "../utils/auth";

// Definição dos tipos para vendas
export interface Venda {
  id: string;
  numero: string;
  data: string;
  status: string;
  nomeCliente: string;
  valorTotal: number;
  totalItens: number;
}

const token = getAuthToken();

interface VendasState {
  vendas: Venda[];
  loading: boolean;
  error: string | null;
  filtros: {
    periodo: string;
    status: string;
    numeroVenda: string;
  };

  // Ações
  fetchVendas: () => Promise<void>;
  setFiltros: (filtros: Partial<VendasState["filtros"]>) => void;
  alterarStatus: (id: string, novoStatus: string) => Promise<void>;
}

// Criação do store com Zustand
const useVendasStore = create<VendasState>((set, get) => ({
  vendas: [],
  loading: false,
  error: null,
  filtros: {
    periodo: "7", // Padrão: últimos 7 dias
    status: "",
    numeroVenda: "",
  },

  // Função para buscar vendas do banco de dados
  fetchVendas: async () => {
    try {
      set({ loading: true, error: null });

      const { filtros } = get();

      // Construir parâmetros de consulta baseados nos filtros
      const params = new URLSearchParams();

      if (filtros.periodo) {
        params.append("periodo", filtros.periodo);
      }

      if (filtros.status) {
        params.append("status", filtros.status);
      }

      if (filtros.numeroVenda) {
        params.append("numeroVenda", filtros.numeroVenda);
      }

      // URL base da API
      const baseUrl = "http://localhost:3001/vendas";
      const url = params.toString()
        ? `${baseUrl}?${params.toString()}`
        : baseUrl;

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar vendas: ${response.status}`);
      }

      const data = await response.json();
      set({ vendas: data, loading: false });
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao buscar vendas",
        loading: false,
      });
    }
  },

  // Função para atualizar filtros
  setFiltros: (novosFiltros) => {
    set((state) => ({
      filtros: {
        ...state.filtros,
        ...novosFiltros,
      },
    }));
  },

  // Função para alterar o status de uma venda
  alterarStatus: async (id: string, novoStatus: string) => {
    try {
      set({ loading: true, error: null });

      // URL para atualizar o status da venda
      const url = `http://localhost:3001/vendas/${id}/status`;

      // Fazer a requisição para a API
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao alterar status da venda: ${response.status}`);
      }

      const vendaAtualizada = await response.json();

      // Atualizar o estado local
      set((state) => ({
        vendas: state.vendas.map((v) =>
          v.id === id ? { ...v, status: novoStatus } : v
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Erro ao alterar status da venda:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao alterar status da venda",
        loading: false,
      });
    }
  },
}));

export default useVendasStore;
