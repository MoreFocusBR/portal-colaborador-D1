import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CustomTable from '../../components/Table/CustomTable';
import FormComponent from '../../components/Form/FormComponent';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { useNotification } from '../../components/Notification/NotificationSystem';
import useGruposStore, { Grupo } from '../../store/gruposStore';

// Lista de telas disponíveis no sistema
const telasDisponiveis = [
  { id: 'tela-inicial', nome: 'Tela Incial' },
  { id: 'transacoes', nome: 'Transações Financeiras' },
  { id: 'mensagens-whatsapp', nome: 'Mensagens WhatsApp' },
  { id: 'mensagens-email', nome: 'Mensagens E-mail' },
  { id: 'usuarios', nome: 'Gerenciamento de Usuários' },
  { id: 'grupos', nome: 'Grupos de Usuários' },
  { id: 'vendas', nome: 'Vendas' },
  { id: 'gestao-eventos', nome: 'Gestão de Eventos' },
  { id: 'gestao-okr', nome: 'Gestão de OKR' }
];

const GruposUsuarios: React.FC = () => {
  const { showNotification } = useNotification();
  const { grupos, loading, error, fetchGrupos, adicionarGrupo, atualizarGrupo, removerGrupo } = useGruposStore();
  
  // Estados locais
  const [openForm, setOpenForm] = useState(false);
  const [openPermissoesDialog, setOpenPermissoesDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [currentGrupo, setCurrentGrupo] = useState<Partial<Grupo> | null>(null);
  const [grupoToDelete, setGrupoToDelete] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [telasPermitidas, setTelasPermitidas] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Efeito para carregar grupos ao montar o componente
  useEffect(() => {
    fetchGrupos().catch(err => {
      showNotification(`Erro ao carregar grupos: ${err.message}`, 'error');
    });
  }, [fetchGrupos, showNotification]);

  // Exibir notificação se houver erro
  useEffect(() => {
    if (error) {
      showNotification(`Erro: ${error}`, 'error');
    }
  }, [error, showNotification]);

  // Função para renderizar chips de telas permitidas
  const renderTelasPermitidas = (telasIds: string[]) => {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {telasIds.map(telaId => {
          const tela = telasDisponiveis.find(t => t.id === telaId);
          return (
            <Chip 
              key={telaId} 
              label={tela ? tela.nome : telaId} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          );
        })}
      </Box>
    );
  };

  // Função para renderizar botão de editar permissões
  const renderEditarPermissoes = (id: string) => {
    return (
      <Button 
        variant="outlined" 
        size="small" 
        onClick={() => handleEditPermissoesClick(id)}
      >
        Editar Permissões
      </Button>
    );
  };

  // Função para renderizar botões de ação
  const renderAcoes = (id: string) => {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          size="small" 
          color="primary" 
          onClick={() => handleEditClick(id)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          color="error" 
          onClick={() => handleDeleteClick(id)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  // Função para abrir o formulário de adição
  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentGrupo(null);
    setFormValues({
      nome: '',
      telasPermitidas: []
    });
    setFormErrors({});
    setOpenForm(true);
  };

  // Função para abrir o formulário de edição
  const handleEditClick = (id: string) => {
    const grupo = grupos.find(g => g.id === id);
    if (grupo) {
      setIsEditing(true);
      setCurrentGrupo(grupo);
      setFormValues({
        nome: grupo.nome,
        telasPermitidas: grupo.telasPermitidas
      });
      setFormErrors({});
      setOpenForm(true);
    }
  };

  // Função para abrir o diálogo de edição de permissões
  const handleEditPermissoesClick = (id: string) => {
    const grupo = grupos.find(g => g.id === id);
    if (grupo) {
      setCurrentGrupo(grupo);
      setTelasPermitidas(grupo.telasPermitidas);
      setOpenPermissoesDialog(true);
    }
  };

  // Função para abrir o modal de confirmação de exclusão
  const handleDeleteClick = (id: string) => {
    setGrupoToDelete(id);
    setOpenDeleteConfirm(true);
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = async () => {
    if (grupoToDelete) {
      try {
        await removerGrupo(grupoToDelete);
        showNotification('Grupo removido com sucesso', 'success');
      } catch (error) {
        showNotification(`Erro ao remover grupo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      }
      setOpenDeleteConfirm(false);
      setGrupoToDelete(null);
    }
  };

  // Função para cancelar exclusão
  const handleCancelDelete = () => {
    setOpenDeleteConfirm(false);
    setGrupoToDelete(null);
  };

  // Função para atualizar valores do formulário
  const handleFormChange = (id: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Limpar erro do campo se foi preenchido
    if (formErrors[id] && value) {
      setFormErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  // Função para alternar seleção de tela permitida
  const handleTelaPermitidaToggle = (telaId: string) => {
    setTelasPermitidas(prev => {
      if (prev.includes(telaId)) {
        return prev.filter(id => id !== telaId);
      } else {
        return [...prev, telaId];
      }
    });
  };

  // Função para salvar permissões
  const handleSavePermissoes = async () => {
    if (currentGrupo) {
      try {
        await atualizarGrupo(currentGrupo.id!, {
          telasPermitidas
        });
        showNotification('Permissões atualizadas com sucesso', 'success');
        setOpenPermissoesDialog(false);
      } catch (error) {
        showNotification(`Erro ao atualizar permissões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      }
    }
  };

  // Função para validar formulário
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formValues.nome) {
      errors.nome = 'Nome é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para salvar grupo
  const handleSaveGrupo = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditing && currentGrupo) {
        await atualizarGrupo(currentGrupo.id!, {
          nome: formValues.nome,
          telasPermitidas: formValues.telasPermitidas
        });
        showNotification('Grupo atualizado com sucesso', 'success');
      } else {
        await adicionarGrupo({
          nome: formValues.nome,
          telasPermitidas: formValues.telasPermitidas || []
        });
        showNotification('Grupo adicionado com sucesso', 'success');
      }
      setOpenForm(false);
    } catch (error) {
      showNotification(`Erro ao salvar grupo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    }
  };

  // Definição das colunas da tabela
  const colunas = [
    { id: 'nome', label: 'Grupo' },
    { 
      id: 'telasPermitidas', 
      label: 'Telas Permitidas',
      format: (value: string[]) => renderTelasPermitidas(value)
    },
    { 
      id: 'id', 
      label: 'Editar Permissões',
      format: (value: string) => renderEditarPermissoes(value)
    },
    { 
      id: 'id', 
      label: 'Ações',
      format: (value: string) => renderAcoes(value)
    }
  ];

  // Campos do formulário
  const formFields = [
    {
      id: 'nome',
      label: 'Nome do Grupo',
      type: 'text' as const,
      required: true
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Grupos de Usuários
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Adicionar Grupo
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1">
          Gerencie os grupos de usuários e suas permissões de acesso. Cada grupo pode ter acesso a diferentes telas do sistema.
        </Typography>
      </Paper>
      
      <CustomTable
        columns={colunas}
        data={grupos}
        loading={loading}
        title="Grupos"
        emptyMessage="Nenhum grupo encontrado"
      />
      
      {/* Modal de formulário */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Editar Grupo' : 'Adicionar Grupo'}
        </DialogTitle>
        <DialogContent>
          <FormComponent
            fields={formFields}
            values={formValues}
            errors={formErrors}
            onChange={handleFormChange}
            onSubmit={handleSaveGrupo}
            submitButtonText="Salvar"
            cancelButtonText="Cancelar"
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Modal de edição de permissões */}
      <Dialog 
        open={openPermissoesDialog} 
        onClose={() => setOpenPermissoesDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Editar Permissões - {currentGrupo?.nome}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selecione as telas que este grupo pode acessar:
          </Typography>
          <FormGroup>
            {telasDisponiveis.map(tela => (
              <FormControlLabel
                key={tela.id}
                control={
                  <Checkbox
                    checked={telasPermitidas.includes(tela.id)}
                    onChange={() => handleTelaPermitidaToggle(tela.id)}
                  />
                }
                label={tela.nome}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermissoesDialog(false)}>Cancelar</Button>
          <Button onClick={handleSavePermissoes} variant="contained" color="primary">
            Salvar Permissões
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de confirmação de exclusão */}
      <ConfirmationModal
        open={openDeleteConfirm}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita."
        confirmButtonText="Excluir"
        cancelButtonText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        severity="error"
      />
    </Box>
  );
};

export default GruposUsuarios;
