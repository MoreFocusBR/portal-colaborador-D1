import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Tabs, // Importar Tabs
  Tab, // Importar Tab
  AppBar, // Para a barra de abas
} from "@mui/material";
import CustomTable from "../../components/Table/CustomTable";
import FilterComponent from "../../components/Filter/FilterComponent";
import { useNotification } from "../../components/Notification/NotificationSystem";
import useTransacoesStore, {
  Transacao,
  EmpresaState,
} from "../../store/transacoesStore";

const empresasConfig = [
  { id: "D1", label: "D1 Fitness" },
  { id: "FORT", label: "FORT" },
  { id: "RDSPORTS", label: "RD Sports" },
];

const TransacoesFinanceiras: React.FC = () => {
  const { showNotification } = useNotification();
  const {
    activeEmpresaId,
    setActiveEmpresaId,
    fetchTransacoes,
    getEmpresaState,
    setFiltros: setStoreFiltros, // Renomeado para clareza
  } = useTransacoesStore();

  // Obtém o estado da empresa ativa
  const { transacoes, loading, error, filtros: filtrosDaEmpresaNoStore } = getEmpresaState(activeEmpresaId);

  // Estados locais para os filtros do frontend (Doc. Pagador, Pagador, Valor)
  // Estes serão específicos para a aba ativa
  const [filtroDocPagador, setFiltroDocPagador] = useState<string>("");
  const [filtroPagador, setFiltroPagador] = useState<string>("");
  const [filtroValor, setFiltroValor] = useState<string>("");

  // Efeito para buscar transações quando a empresa ativa ou seus filtros de API mudam
  useEffect(() => {
    const payload = {
      dataInicio: filtrosDaEmpresaNoStore.dataInicial,
      dataFim: filtrosDaEmpresaNoStore.dataFinal,
      tokenExtrato: "klajdfJHGS5%$#$99", // Este token parece ser global
      dias: 60, // Este campo parece ser global
    };
    fetchTransacoes(activeEmpresaId, payload).catch((err) => {
      showNotification(
        `Erro ao carregar transações (${activeEmpresaId}): ${err.message}`,
        "error"
      );
    });
  }, [activeEmpresaId, filtrosDaEmpresaNoStore.dataInicial, filtrosDaEmpresaNoStore.dataFinal, fetchTransacoes, showNotification]);

  // Efeito para mostrar notificações de erro
  useEffect(() => {
    if (error) {
      showNotification(`Erro (${activeEmpresaId}): ${error}`, "error");
    }
  }, [error, activeEmpresaId, showNotification]);
  
  // Resetar filtros locais ao mudar de aba
  useEffect(() => {
    setFiltroDocPagador("");
    setFiltroPagador("");
    setFiltroValor("");
  }, [activeEmpresaId]);

  const handleTabChange = (event: React.SyntheticEvent, novaEmpresaId: string) => {
    setActiveEmpresaId(novaEmpresaId);
  };

  const formatarDataHora = (dataString: string) => {
    if (!dataString) return "-";
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR");
  };

  const formatarValor = (valorString: string) => {
    const valorNum = parseFloat(valorString);
    if (isNaN(valorNum)) return "-";
    return valorNum.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

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
      case "TRANSFERENCIA":
      case "TRANSFERÊNCIA":
        color = "info";
        break;
      case "BOLETO":
        color = "warning";
        break;
      case "INVESTIMENTO":
        color = "secondary";
        break;
    }
    return <Chip label={tipo || "N/A"} color={color} size="small" />;
  };

  const renderTipoOperacao = (tipo: string) => {
    const color = tipo === "C" ? "success" : "error";
    const label = tipo === "C" ? "Crédito" : "Débito";
    return <Chip label={label} color={color} size="small" />;
  };

  const colunas = [
    { id: "dataInclusao", label: "Data/Hora", format: (value: string) => formatarDataHora(value) },{ id: "tipoTransacao", label: "Tipo Transação", format: (value: string) => renderTipoTransacao(value) },
    { id: "tipoOperacao", label: "Operação", format: (value: string) => renderTipoOperacao(value) },
    { id: "valor", label: "Valor", format: (value: string) => formatarValor(value) },
    { id: "titulo", label: "Título" },
    { id: "descricao", label: "Descrição" },
    { id: "detalhes.nomePagador", label: "Pagador", format: (value: any, row: Transacao) => row.detalhes?.nomePagador || "-" },
    { id: "detalhes.cpfCnpjPagador", label: "Doc. Pagador", format: (value: any, row: Transacao) => row.detalhes?.cpfCnpjPagador || "-" },
    { id: "numeroDocumento", label: "Nº Documento" },
    
  ];

  const handleFilter = (filtrosRecebidos: any) => {
    const novaDataInicio =
      filtrosRecebidos.startDate
        ? new Date(filtrosRecebidos.startDate).toISOString().split("T")[0]
        : filtrosDaEmpresaNoStore.dataInicial;
    const novaDataFim =
      filtrosRecebidos.endDate
        ? new Date(filtrosRecebidos.endDate).toISOString().split("T")[0]
        : filtrosDaEmpresaNoStore.dataFinal;

    // Atualiza filtros de data no store (que dispara o fetch via useEffect)
    setStoreFiltros(activeEmpresaId, {
      dataInicial: novaDataInicio,
      dataFinal: novaDataFim,
    });

    // Atualiza os estados dos filtros locais do frontend
    setFiltroDocPagador(filtrosRecebidos.docPagador || "");
    setFiltroPagador(filtrosRecebidos.pagador || "");
    setFiltroValor(filtrosRecebidos.valor || "");
  };

  const transacoesFiltradasGlobalmente = useMemo(() => {
    const pagadorExcluido = "D1 Distribuidora De Equipamentos Esportivos Ltda".toLowerCase();
    const tipoTransacaoExcluida = "INVESTIMENTO".toLowerCase();

    return transacoes.filter((transacao) => {
      const pagadorEhExcluido =
        transacao.detalhes?.nomePagador?.toLowerCase() === pagadorExcluido;
      const tipoTransacaoEhExcluida =
        transacao.tipoTransacao?.toLowerCase() === tipoTransacaoExcluida;

      if (pagadorEhExcluido || tipoTransacaoEhExcluida) {
        return false;
      }
      return true;
    });
  }, [transacoes]);

  const transacoesFiltradasLocalmente = useMemo(() => {
    return transacoesFiltradasGlobalmente.filter((transacao) => {
      const docPagadorMatch = filtroDocPagador
        ? transacao.detalhes?.cpfCnpjPagador
            ?.toLowerCase()
            .includes(filtroDocPagador.toLowerCase())
        : true;
      const pagadorMatch = filtroPagador
        ? transacao.detalhes?.nomePagador
            ?.toLowerCase()
            .includes(filtroPagador.toLowerCase())
        : true;
      const valorMatch = filtroValor
        ? parseFloat(transacao.valor) === parseFloat(filtroValor)
        : true;

      return docPagadorMatch && pagadorMatch && valorMatch;
    });
  }, [
    transacoesFiltradasGlobalmente,
    filtroDocPagador,
    filtroPagador,
    filtroValor,
  ]);

  
  useEffect(() => {
  console.log("Transações recebidas do backend:", transacoes);
}, [transacoes]);

useEffect(() => {
  console.log("Transações filtradas:", transacoesFiltradasLocalmente);
}, [transacoesFiltradasLocalmente]);

console.log("Dados recebidos pelo CustomTable:", transacoesFiltradasLocalmente);
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transações Financeiras
      </Typography>

      <AppBar position="static" color="default" sx={{ mb: 2, boxShadow:1 }}>
        <Tabs
          value={activeEmpresaId}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="Abas de seleção de empresa"
        >
          {empresasConfig.map((empresa) => (
            <Tab key={empresa.id} label={empresa.label} value={empresa.id} />
          ))}
        </Tabs>
      </AppBar>

      <FilterComponent
        key={activeEmpresaId} // Força recriação do componente para resetar estados internos de data
        onFilter={handleFilter}
        dateRangeFilter={false}
        searchFilter={false} 
        docPagadorFilter={true}
        pagadorFilter={true}
        valorFilter={true}
      />

      <CustomTable
        columns={colunas}
        data={transacoesFiltradasLocalmente}
        defaultRowsPerPage={50}
        rowsPerPageOptions={[10, 25, 50, 100]}
        loading={loading}
        title={`Extrato de Transações - ${empresasConfig.find(e => e.id === activeEmpresaId)?.label}`}
        emptyMessage="Nenhuma transação encontrada para os filtros aplicados"
      />
    </Box>
  );
  
};

export default TransacoesFinanceiras;

