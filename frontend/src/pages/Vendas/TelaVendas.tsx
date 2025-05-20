import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Paper,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import CustomTable from '../../components/Table/CustomTable';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { useNotification } from '../../components/Notification/NotificationSystem';
import useVendasStore, { Venda } from '../../store/vendasStore';
import { GridView } from '@mui/icons-material';

// Opções para o filtro de período
const periodoOptions = [
  { value: '1', label: 'Últimos 1 dia' },
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' }
];

// Opções para o filtro de status
const statusOptions = [
  { value: 'Financeiro Validado', label: 'Financeiro Validado' },
  { value: 'A Enviar', label: 'A Enviar' },
  { value: 'Aguardando Estoque', label: 'Aguardando Estoque' },
  { value: 'Aguard. Autoriz. para Expedir', label: 'Aguard. Autoriz. para Expedir' },
  { value: 'Enviado', label: 'Enviado' },
  { value: 'Entregue', label: 'Entregue' },
  { value: 'Cancelado', label: 'Cancelado' }
];

const TelaVendas: React.FC = () => {
  const { showNotification } = useNotification();
  const { vendas, loading, error, filtros, fetchVendas, setFiltros, alterarStatus } = useVendasStore();
  
  // Estados locais
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [vendaParaAlterar, setVendaParaAlterar] = useState<{ id: string, novoStatus: string } | null>(null);
  const [periodoFiltro, setPeriodoFiltro] = useState(filtros.periodo);
  const [statusFiltro, setStatusFiltro] = useState(filtros.status);
  const [numeroVendaFiltro, setNumeroVendaFiltro] = useState(filtros.numeroVenda);

  // Efeito para carregar vendas ao montar o componente
  useEffect(() => {
    fetchVendas().catch(err => {
      showNotification(`Erro ao carregar vendas: ${err.message}`, 'error');
    });
  }, [fetchVendas, showNotification]);

  // Exibir notificação se houver erro
  useEffect(() => {
    if (error) {
      showNotification(`Erro: ${error}`, 'error');
    }
  }, [error, showNotification]);

  // Função para formatar data
  const formatarData = (data: string) => {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  };

  // Função para formatar valor monetário
  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para renderizar chip de status
  const renderStatus = (status: string) => {
    let color: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default';
    
    switch (status) {
      case 'Financeiro Validado':
        color = 'info';
        break;
      case 'A Enviar':
        color = 'warning';
        break;
      case 'Aguardando Estoque':
        color = 'error';
        break;
      case 'Aguard. Autoriz. para Expedir':
        color = 'warning';
        break;
      case 'Enviado':
        color = 'success';
        break;
      case 'Entregue':
        color = 'success';
        break;
      case 'Cancelado':
        color = 'error';
        break;
    }
    
    return <Chip label={status} color={color} size="small" />;
  };

  // Função para renderizar botão de troca de status "A Enviar"
  const renderBotaoAEnviar = (venda: Venda) => {
    const disabled = venda.status !== 'Financeiro Validado';
    
    return (
      <Button 
        variant="outlined" 
        color="primary" 
        size="small" 
        disabled={disabled}
        onClick={() => handleAlterarStatus(venda.id, 'A Enviar')}
      >
        A Enviar
      </Button>
    );
  };

  // Função para renderizar botão de troca de status "Aguardando Estoque"
  const renderBotaoAguardandoEstoque = (venda: Venda) => {
    const disabled = venda.status !== 'Financeiro Validado';
    
    return (
      <Button 
        variant="outlined" 
        color="warning" 
        size="small" 
        disabled={disabled}
        onClick={() => handleAlterarStatus(venda.id, 'Aguardando Estoque')}
      >
        Aguardando Estoque
      </Button>
    );
  };

  // Função para renderizar botão de troca de status "Aguard. Autoriz. para Expedir"
  const renderBotaoAguardandoAutorizacao = (venda: Venda) => {
    const disabled = venda.status !== 'Financeiro Validado';
    
    return (
      <Button 
        variant="outlined" 
        color="secondary" 
        size="small" 
        disabled={disabled}
        onClick={() => handleAlterarStatus(venda.id, 'Aguard. Autoriz. para Expedir')}
      >
        Aguard. Autoriz.
      </Button>
    );
  };

  // Função para abrir modal de confirmação de alteração de status
  const handleAlterarStatus = (id: string, novoStatus: string) => {
    setVendaParaAlterar({ id, novoStatus });
    setOpenConfirmModal(true);
  };

  // Função para confirmar alteração de status
  const handleConfirmAlterarStatus = async () => {
    if (vendaParaAlterar) {
      try {
        await alterarStatus(vendaParaAlterar.id, vendaParaAlterar.novoStatus);
        showNotification(`Status da venda alterado para ${vendaParaAlterar.novoStatus}`, 'success');
      } catch (error) {
        showNotification(`Erro ao alterar status da venda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      }
      setOpenConfirmModal(false);
      setVendaParaAlterar(null);
    }
  };

  // Função para cancelar alteração de status
  const handleCancelAlterarStatus = () => {
    setOpenConfirmModal(false);
    setVendaParaAlterar(null);
  };

  // Função para aplicar filtros
  const handleAplicarFiltros = () => {
    setFiltros({
      periodo: periodoFiltro,
      status: statusFiltro,
      numeroVenda: numeroVendaFiltro
    });
    
    fetchVendas();
  };

  // Função para limpar filtros
  const handleLimparFiltros = () => {
    setPeriodoFiltro('7');
    setStatusFiltro('');
    setNumeroVendaFiltro('');
    
    setFiltros({
      periodo: '7',
      status: '',
      numeroVenda: ''
    });
    
    fetchVendas();
  };

  // Handlers para mudanças nos filtros
  const handlePeriodoChange = (event: SelectChangeEvent) => {
    setPeriodoFiltro(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFiltro(event.target.value);
  };

  const handleNumeroVendaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumeroVendaFiltro(event.target.value);
  };

  // Definição das colunas da tabela
  const colunas = [
    { id: 'numero', label: 'Número da Venda' },
    { 
      id: 'data', 
      label: 'Data',
      format: (value: string) => formatarData(value)
    },
    { 
      id: 'status', 
      label: 'Status',
      format: (value: string) => renderStatus(value)
    },
    { id: 'nomeCliente', label: 'Nome do Cliente' },
    { 
      id: 'valorTotal', 
      label: 'Valor Total',
      format: (value: number) => formatarValor(value)
    },
    { id: 'totalItens', label: 'Total de Itens' },
    { 
      id: 'id', 
      label: 'A Enviar',
      format: (row: Venda) => renderBotaoAEnviar(row)
    },
    { 
      id: 'id', 
      label: 'Aguardando Estoque',
      format: (row: Venda) => renderBotaoAguardandoEstoque(row)
    },
    { 
      id: 'id', 
      label: 'Aguard. Autoriz.',
      format: (row: Venda) => renderBotaoAguardandoAutorizacao(row)
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vendas
      </Typography>
      
      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
            <FormControl fullWidth>
              <InputLabel id="periodo-select-label">Período</InputLabel>
              <Select
                labelId="periodo-select-label"
                id="periodo-select"
                value={periodoFiltro}
                label="Período"
                onChange={handlePeriodoChange}
              >
                {periodoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={statusFiltro}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
            <TextField
              fullWidth
              label="Número da Venda"
              variant="outlined"
              value={numeroVendaFiltro}
              onChange={handleNumeroVendaChange}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6, md: 3 }} component="div">
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                onClick={handleLimparFiltros}
                fullWidth
              >
                Limpar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAplicarFiltros}
                fullWidth
              >
                Aplicar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabela de Vendas */}
      <CustomTable
        columns={colunas}
        data={vendas}
        loading={loading}
        title="Vendas"
        emptyMessage="Nenhuma venda encontrada"
      />
      
      {/* Modal de confirmação de alteração de status */}
      <ConfirmationModal
        open={openConfirmModal}
        title="Confirmar Alteração de Status"
        message={`Tem certeza que deseja alterar o status desta venda para "${vendaParaAlterar?.novoStatus}"?`}
        confirmButtonText="Confirmar"
        cancelButtonText="Cancelar"
        onConfirm={handleConfirmAlterarStatus}
        onCancel={handleCancelAlterarStatus}
        severity="warning"
      />
    </Box>
  );
};

export default TelaVendas;
