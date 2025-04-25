import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import CustomTable from '../../components/Table/CustomTable';
import FilterComponent from '../../components/Filter/FilterComponent';
import { useNotification } from '../../components/Notification/NotificationSystem';
import useTransacoesStore, { Transacao } from '../../store/transacoesStore';

// Opções para o filtro de tipo de transação
const tipoTransacaoOptions = [
  { value: 'PIX', label: 'PIX' },
  { value: 'Transferência', label: 'Transferência' },
  { value: 'Boleto', label: 'Boleto' }
];

const TransacoesFinanceiras: React.FC = () => {
  const { showNotification } = useNotification();
  const { transacoes, loading, error, fetchTransacoes, setFiltros } = useTransacoesStore();

  // Efeito para carregar transações ao montar o componente
  useEffect(() => {
    fetchTransacoes().catch(err => {
      showNotification(`Erro ao carregar transações: ${err.message}`, 'error');
    });
  }, [fetchTransacoes, showNotification]);

  // Exibir notificação se houver erro
  useEffect(() => {
    if (error) {
      showNotification(`Erro: ${error}`, 'error');
    }
  }, [error, showNotification]);

  // Função para formatar data/hora
  const formatarDataHora = (dataHora: string) => {
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR');
  };

  // Função para formatar valor monetário
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para renderizar chip de tipo de transação
  const renderTipoTransacao = (tipo: string) => {
    let color: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default' = 'default';
    
    switch (tipo) {
      case 'PIX':
        color = 'primary';
        break;
      case 'Transferência':
        color = 'info';
        break;
      case 'Boleto':
        color = 'warning';
        break;
    }
    
    return <Chip label={tipo} color={color} size="small" />;
  };

  // Função para renderizar chip de tipo de operação
  const renderTipoOperacao = (tipo: string) => {
    const color = tipo === 'C' ? 'success' : 'error';
    const label = tipo === 'C' ? 'Crédito' : 'Débito';
    
    return <Chip label={label} color={color} size="small" />;
  };

  // Definição das colunas da tabela
  const colunas = [
    { 
      id: 'dataHora', 
      label: 'Data/Hora', 
      format: (value: string) => formatarDataHora(value) 
    },
    { 
      id: 'tipoTransacao', 
      label: 'Tipo Transação', 
      format: (value: string) => renderTipoTransacao(value) 
    },
    { 
      id: 'tipoOperacao', 
      label: 'Tipo Operação', 
      format: (value: string) => renderTipoOperacao(value) 
    },
    { 
      id: 'valor', 
      label: 'Valor', 
      format: (value: number) => formatarValor(value) 
    },
    { id: 'pagador', label: 'Pagador' },
    { id: 'documentoPagador', label: 'Documento do Pagador' }
  ];

  // Função para aplicar filtros
  const handleFilter = (filtros: any) => {
    setFiltros({
      dataInicial: filtros.startDate || null,
      dataFinal: filtros.endDate || null,
      tipoTransacao: filtros.type || ''
    });
    
    fetchTransacoes();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transações Financeiras
      </Typography>
      
      <FilterComponent
        onFilter={handleFilter}
        dateRangeFilter={true}
        typeFilter={true}
        typeOptions={tipoTransacaoOptions}
      />
      
      <CustomTable
        columns={colunas}
        data={transacoes}
        loading={loading}
        title="Transações"
        emptyMessage="Nenhuma transação encontrada"
      />
    </Box>
  );
};

export default TransacoesFinanceiras;
