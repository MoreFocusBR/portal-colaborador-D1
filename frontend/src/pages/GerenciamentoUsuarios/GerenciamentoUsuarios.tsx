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
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CustomTable from '../../components/Table/CustomTable';
import FormComponent from '../../components/Form/FormComponent';
import ConfirmationModal from '../../components/Modal/ConfirmationModal';
import { useNotification } from '../../components/Notification/NotificationSystem';
import useUsuariosStore, { Usuario } from '../../store/usuariosStore';
import useGruposStore from '../../store/gruposStore';

const GerenciamentoUsuarios: React.FC = () => {
  const { showNotification } = useNotification();
  const { usuarios, loading, error, fetchUsuarios, adicionarUsuario, atualizarUsuario, removerUsuario } = useUsuariosStore();
  const { grupos, fetchGrupos } = useGruposStore();
  
  // Estados locais
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Partial<Usuario> | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({
    nome: '',
    email: '',
    grupos: [] // Inicialização correta do array vazio
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Efeito para carregar usuários e grupos ao montar o componente
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUsuarios();
        await fetchGrupos();
      } catch (err) {
        showNotification(`Erro ao carregar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`, 'error');
      }
    };
    
    loadData();
  }, [fetchUsuarios, fetchGrupos, showNotification]);

  // Exibir notificação se houver erro
  useEffect(() => {
    if (error) {
      showNotification(`Erro: ${error}`, 'error');
    }
  }, [error, showNotification]);

  // Função para formatar data/hora
  const formatarDataHora = (dataHora: string): string => {
    try {
      const data = new Date(dataHora);
      return data.toLocaleString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Função para renderizar chips de grupos
  const renderGrupos = (gruposIds: string[]): React.ReactNode => {
    if (!gruposIds || !Array.isArray(gruposIds) || gruposIds.length === 0) {
      return <Typography variant="body2">Nenhum grupo</Typography>;
    }
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {gruposIds.map(grupoId => {
          const grupo = grupos.find(g => g.id === grupoId);
          return (
            <Chip 
              key={grupoId} 
              label={grupo ? grupo.nome : grupoId} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          );
        })}
      </Box>
    );
  };

  // Função para renderizar botões de ação
  const renderAcoes = (id: string): React.ReactNode => {
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
    setCurrentUsuario(null);
    setFormValues({
      nome: '',
      email: '',
      grupos: []
    });
    setFormErrors({});
    setOpenForm(true);
  };

  // Função para abrir o formulário de edição
  const handleEditClick = (id: string) => {
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
      setIsEditing(true);
      setCurrentUsuario(usuario);
      setFormValues({
        nome: usuario.nome,
        email: usuario.email,
        grupos: Array.isArray(usuario.grupos) ? usuario.grupos : [] // Garantir que grupos seja um array
      });
      setFormErrors({});
      setOpenForm(true);
    }
  };

  // Função para abrir o modal de confirmação de exclusão
  const handleDeleteClick = (id: string) => {
    setUsuarioToDelete(id);
    setOpenDeleteConfirm(true);
  };

  // Função para confirmar exclusão
  const handleConfirmDelete = async () => {
    if (usuarioToDelete) {
      try {
        await removerUsuario(usuarioToDelete);
        showNotification('Usuário removido com sucesso', 'success');
      } catch (error) {
        showNotification(`Erro ao remover usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      }
      setOpenDeleteConfirm(false);
      setUsuarioToDelete(null);
    }
  };

  // Função para cancelar exclusão
  const handleCancelDelete = () => {
    setOpenDeleteConfirm(false);
    setUsuarioToDelete(null);
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

  // Função para validar formulário
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formValues.nome) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!formValues.email) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'E-mail inválido';
    }
    
    // Garantir que grupos seja um array
    if (!Array.isArray(formValues.grupos)) {
      setFormValues(prev => ({
        ...prev,
        grupos: []
      }));
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Função para salvar usuário
  const handleSaveUsuario = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditing && currentUsuario && currentUsuario.id) {
        await atualizarUsuario(currentUsuario.id, {
          nome: formValues.nome,
          email: formValues.email,
          grupos: Array.isArray(formValues.grupos) ? formValues.grupos : []
        });
        showNotification('Usuário atualizado com sucesso', 'success');
      } else {
        await adicionarUsuario({
          nome: formValues.nome,
          email: formValues.email,
          grupos: Array.isArray(formValues.grupos) ? formValues.grupos : [],
          ultimaAtividade: new Date().toISOString()
        });
        showNotification('Usuário adicionado com sucesso', 'success');
      }
      setOpenForm(false);
    } catch (error) {
      showNotification(`Erro ao salvar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    }
  };

  // Função para fechar o formulário
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  // Definição das colunas da tabela
  const colunas = [
    { id: 'nome', label: 'Nome' },
    { id: 'email', label: 'E-mail' },
    { 
      id: 'grupos', 
      label: 'Grupos',
      format: (value: string[]) => renderGrupos(value)
    },
    { 
      id: 'ultimaAtividade', 
      label: 'Última Atividade',
      format: (value: string) => formatarDataHora(value)
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
      label: 'Nome',
      type: 'text' as const,
      required: true
    },
    {
      id: 'email',
      label: 'E-mail',
      type: 'email' as const,
      required: true
    },
    {
      id: 'grupos',
      label: 'Grupos',
      type: 'select' as const,
      multiple: true, // Permitir múltipla seleção
      required: false,
      options: grupos.map(grupo => ({ value: grupo.id, label: grupo.nome })),
      fullWidth: true
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Gerenciamento de Usuários
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Adicionar Usuário
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1">
          Gerencie os usuários do sistema e seus grupos de acesso. Cada usuário pode pertencer a múltiplos grupos, que determinam quais telas ele pode acessar.
        </Typography>
      </Paper>
      
      <CustomTable
        columns={colunas}
        data={usuarios}
        loading={loading}
        title="Usuários"
        emptyMessage="Nenhum usuário encontrado"
      />
      
      {/* Modal de formulário */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}
        </DialogTitle>
        <DialogContent>
          <FormComponent
            fields={formFields}
            values={formValues}
            errors={formErrors}
            onChange={handleFormChange}
            onSubmit={handleSaveUsuario} // onSubmit é obrigatório
            submitButtonText="" // Esconder texto do botão para não exibi-lo
            cancelButtonText=""  // Esconder texto do botão para não exibi-lo
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveUsuario} 
            variant="contained" 
            color="primary"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Modal de confirmação de exclusão */}
      <ConfirmationModal
        open={openDeleteConfirm}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmButtonText="Excluir"
        cancelButtonText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        severity="error"
      />
    </Box>
  );
};

export default GerenciamentoUsuarios;