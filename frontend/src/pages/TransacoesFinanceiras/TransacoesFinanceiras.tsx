import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, Chip } from "@mui/material";
import CustomTable from "../../components/Table/CustomTable";
import FilterComponent from "../../components/Filter/FilterComponent";
import { useNotification } from "../../components/Notification/NotificationSystem";
import useTransacoesStore, { Transacao } from "../../store/transacoesStore";

const TransacoesFinanceiras: React.FC = () => {
  const { showNotification } = useNotification();
  const { 
    transacoes: transacoesOriginais, // Renomear para evitar conflito com transacoes filtradas
    loading, 
    error, 
    fetchTransacoes, 
    setFiltros: setStoreFiltros, // Renomear para evitar conflito
    filtros: storeFiltros
  } = useTransacoesStore();

  
  // Estados locais para os novos filtros do frontend
  const [filtroDocPagador, setFiltroDocPagador] = useState<string>('');
  const [filtroPagador, setFiltroPagador] = useState<string>('');
  const [filtroValor, setFiltroValor] = useState<string>('');
  // Estado para os filtros de data aplicados pela API
  const [filtrosApiAplicados, setFiltrosApiAplicados] = useState({
    dataInicio: storeFiltros.dataInicial,
    dataFim: storeFiltros.dataFinal,
  });


  // Efeito para carregar transações ao montar o componente com o payload padrão
  useEffect(() => {
    // Payload inicial conforme especificado
    const initialPayload = {
      dataInicio: storeFiltros.dataInicial, // Vem do estado inicial do store
      dataFim: storeFiltros.dataFinal, // Vem do estado inicial do store
      tokenExtrato: "klajdfJHGS5%$#$99",
      dias: 60,
    };
    fetchTransacoes(initialPayload).catch((err) => {
      showNotification(`Erro ao carregar transações: ${err.message}`, "error");
    });
  }, [
    fetchTransacoes,
    showNotification,
    storeFiltros.dataInicial,
    storeFiltros.dataFinal,
  ]);

  // Exibir notificação se houver erro
  useEffect(() => {
    if (error) {
      showNotification(`Erro: ${error}`, "error");
    }
  }, [error, showNotification]);

  // Função para formatar data/hora (ajustar para o formato da API)
  const formatarDataHora = (dataString: string) => {
    if (!dataString) return "-";
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR");
  };

  // Função para formatar valor monetário (API retorna string)
  const formatarValor = (valorString: string) => {
    const valor = parseFloat(valorString);
    if (isNaN(valor)) return "-";
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Função para renderizar chip de tipo de transação
  const renderTipoTransacao = (tipo: string) => {
    let color:
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "info"
      | "warning"
      | "default" = "default";
    switch (tipo?.toUpperCase()) {
      case "PIX":
        color = "primary";
        break;
      case "TRANSFERENCIA": // Ajustar conforme os valores da API
      case "TRANSFERÊNCIA":
        color = "info";
        break;
      case "BOLETO":
        color = "warning";
        break;
      // Adicionar outros casos conforme necessário
    }
    return <Chip label={tipo || "N/A"} color={color} size="small" />;
  };

  // Função para renderizar chip de tipo de operação
  const renderTipoOperacao = (tipo: string) => {
    const color = tipo === "C" ? "success" : "error";
    const label = tipo === "C" ? "Crédito" : "Débito";
    return <Chip label={label} color={color} size="small" />;
  };

  // Definição das colunas da tabela ajustadas para a nova API
  const colunas = [
    {
      id: "dataTransacao",
      label: "Data Transação",
      format: (value: string) => formatarDataHora(value),
    },
    {
      id: "tipoTransacao",
      label: "Tipo Transação",
      format: (value: string) => renderTipoTransacao(value),
    },
    {
      id: "tipoOperacao",
      label: "Operação",
      format: (value: string) => renderTipoOperacao(value),
    },
    {
      id: "valor",
      label: "Valor",
      format: (value: string) => formatarValor(value),
    },
    { id: "titulo", label: "Título" },
    { id: "descricao", label: "Descrição" },
    {
      id: "detalhes.nomePagador",
      label: "Pagador",
      // Acessar dados aninhados com segurança
      format: (value: any, row: Transacao) => row.detalhes?.nomePagador || "-",
    },
    {
      id: "detalhes.cpfCnpjPagador",
      label: "Doc. Pagador",
      format: (value: any, row: Transacao) =>
        row.detalhes?.cpfCnpjPagador || "-",
    },
    { id: "numeroDocumento", label: "Nº Documento" },
    {
      id: "dataInclusao",
      label: "Data Inclusão",
      format: (value: string) => formatarDataHora(value),
    },
  ];

  // Função para aplicar filtros
  const handleFilter = (filtrosRecebidos: any) => {
    // Atualiza os filtros que vão para a API (data)
    const novaDataInicio = filtrosRecebidos.startDate ? new Date(filtrosRecebidos.startDate).toISOString().split('T')[0] : storeFiltros.dataInicial;
    const novaDataFim = filtrosRecebidos.endDate ? new Date(filtrosRecebidos.endDate).toISOString().split('T')[0] : storeFiltros.dataFinal;

    if (novaDataInicio !== filtrosApiAplicados.dataInicio || novaDataFim !== filtrosApiAplicados.dataFim) {
      setFiltrosApiAplicados({ dataInicio: novaDataInicio, dataFim: novaDataFim });
      // A busca será refeita pelo useEffect que depende de filtrosApiAplicados
    }
    
    // Atualiza os estados dos filtros locais do frontend
    setFiltroDocPagador(filtrosRecebidos.docPagador || '');
    setFiltroPagador(filtrosRecebidos.pagador || '');
    setFiltroValor(filtrosRecebidos.valor || '');

    // Atualiza os filtros de data no store, caso queira manter essa lógica
    setStoreFiltros({
      dataInicial: novaDataInicio,
      dataFinal: novaDataFim,
    });
  };

  
  // Aplica os filtros do frontend aos dados recebidos da API
  const transacoesFiltradas = useMemo(() => {
    const pagadorExcluido = "D1 Distribuidora De Equipamentos Esportivos Ltda".toLowerCase();
    const pagadorExcluido2 = "Appmax Plataforma Vendas Ltda".toLowerCase();
    const tipoTransacaoExcluida = "INVESTIMENTO".toLowerCase();

    return transacoesOriginais.filter(transacao => {
      
      // Condições de exclusão
      const pagadorEhExcluido = 
        transacao.detalhes?.nomePagador?.toLowerCase() === pagadorExcluido;
      const pagadorEhExcluido2 = 
        transacao.detalhes?.nomePagador?.toLowerCase() === pagadorExcluido2;
      const tipoTransacaoEhExcluida = 
        transacao.tipoTransacao?.toLowerCase() === tipoTransacaoExcluida;

      if (pagadorEhExcluido || pagadorEhExcluido2 || tipoTransacaoEhExcluida) {
        return false; // Exclui o registro
      }

      const docPagadorMatch = filtroDocPagador 
        ? transacao.detalhes?.cpfCnpjPagador?.toLowerCase().includes(filtroDocPagador.toLowerCase())
        : true;
      const pagadorMatch = filtroPagador 
        ? transacao.detalhes?.nomePagador?.toLowerCase().includes(filtroPagador.toLowerCase())
        : true;
      const valorMatch = filtroValor
        ? parseFloat(transacao.valor) === parseFloat(filtroValor) // Comparação exata para valor
        : true;
      
      return docPagadorMatch && pagadorMatch && valorMatch;
    });
  }, [transacoesOriginais, filtroDocPagador, filtroPagador, filtroValor]);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transações Financeiras (API Externa)
      </Typography>

      <FilterComponent
        onFilter={handleFilter}
        dateRangeFilter={false} // Prop individual
        docPagadorFilter={true} // Prop individual
        pagadorFilter={true} // Prop individual
        valorFilter={true} // Prop individual
        searchFilter={false} // Prop individual
        // Outras props de filtro como typeFilter, typeOptions, etc., podem ser adicionadas aqui diretamente se necessário.
      />

      <CustomTable
        columns={colunas}
        // A API retorna um objeto com a propriedade 'transacoes'
        data={transacoesFiltradas}
        loading={loading}
        title="Extrato de Transações"
        emptyMessage="Nenhuma transação encontrada para os filtros aplicados"
        // Adicionar props de paginação se a CustomTable suportar e a API fornecer dados para isso
        // count={totalElementos} // Exemplo
        // page={paginaAtual} // Exemplo
        // rowsPerPage={itensPorPagina} // Exemplo
        // onPageChange={handleChangePage} // Exemplo
        // onRowsPerPageChange={handleChangeRowsPerPage} // Exemplo
      />
    </Box>
  );
};

export default TransacoesFinanceiras;
