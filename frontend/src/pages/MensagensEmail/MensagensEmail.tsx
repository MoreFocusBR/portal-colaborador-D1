import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, Switch, FormControlLabel, Paper } from '@mui/material';
import CustomTable from '../../components/Table/CustomTable';
import { useNotification } from '../../components/Notification/NotificationSystem';
import useMensagensEmailStore, { MensagemEmail } from '../../store/mensagensEmailStore';

const MensagensEmail: React.FC = () => {
  const { showNotification } = useNotification();
  const { mensagens, loading, error, fetchMensagens, toggleAtivoStatus } = useMensagensEmailStore();

  // Efeito para carregar mensagens ao montar o componente
  useEffect(() => {
    fetchMensagens().catch(err => {
      showNotification(`Erro ao carregar mensagens: ${err.message}`, 'error');
    });
  }, [fetchMensagens, showNotification]);

  // Exibir notificação se houver erro
  useEffect(() => {
    if (error) {
      showNotification(`Erro: ${error}`, 'error');
    }
  }, [error, showNotification]);

  // Função para renderizar chip de status
  const renderStatus = (status: string) => {
    let color: 'success' | 'error' | 'warning' | 'info' = 'info';
    
    switch (status.toLowerCase()) {
      case 'ativo':
      case 'aprovado':
        color = 'success';
        break;
      case 'inativo':
      case 'rejeitado':
        color = 'error';
        break;
      case 'pendente':
        color = 'warning';
        break;
    }
    
    return <Chip label={status} color={color} size="small" />;
  };

  // Função para renderizar mensagem com destaque para placeholders
  const renderMensagem = (mensagem: string) => {
    // Substituir placeholders por versões destacadas
    const mensagemFormatada = mensagem.replace(
      /\{\{([^}]+)\}\}/g, 
      (match, placeholder) => `<span style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 4px; font-weight: bold;">{{${placeholder}}}</span>`
    );
    
    return (
      <div dangerouslySetInnerHTML={{ __html: mensagemFormatada }} />
    );
  };

  // Função para renderizar switch de ativo/inativo
  const renderAtivoSwitch = (ativo: boolean, id: string) => {
    return (
      <FormControlLabel
        control={
          <Switch
            checked={ativo}
            onChange={() => handleToggleAtivo(id)}
            color="primary"
          />
        }
        label={ativo ? "Ativo" : "Inativo"}
      />
    );
  };

  // Função para alternar status ativo
  const handleToggleAtivo = async (id: string) => {
    try {
      await toggleAtivoStatus(id);
      showNotification('Status atualizado com sucesso', 'success');
    } catch (error) {
      showNotification(`Erro ao atualizar status: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    }
  };

  // Definição das colunas da tabela
  const colunas = [
    { 
      id: 'status', 
      label: 'Status', 
      format: (value: string) => renderStatus(value) 
    },
    { 
      id: 'mensagem', 
      label: 'Mensagem', 
      format: (value: string) => renderMensagem(value),
      minWidth: 350
    },
    { 
      id: 'ativo', 
      label: 'Ativo', 
      format: (value: boolean, row: MensagemEmail) => renderAtivoSwitch(value, row.id) 
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Templates de Mensagens E-mail
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1">
          Gerencie os templates de mensagens de e-mail. As mensagens podem conter placeholders como <strong>{'{{primeiroNome}}'}</strong> ou <strong>{'{{numeroPedido}}'}</strong> que serão substituídos pelos valores reais quando o e-mail for enviado.
        </Typography>
      </Paper>
      
      <CustomTable
        columns={colunas}
        data={mensagens}
        loading={loading}
        title="Templates de E-mail"
        emptyMessage="Nenhum template de e-mail encontrado"
      />
    </Box>
  );
};

export default MensagensEmail;
