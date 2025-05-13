import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CustomTable from "../../components/Table/CustomTable";
import { useNotification } from "../../components/Notification/NotificationSystem";
import useMensagensWhatsAppStore, {
  MensagemWhatsApp,
} from "../../store/mensagensWhatsAppStore";

// Interface para o estado de edição
interface EdicaoState {
  id: string;
  status: string;
  mensagem: string;
  ativo: boolean;
}

const MensagensWhatsApp: React.FC = () => {
  const { showNotification } = useNotification();
  const { mensagens, loading, error, fetchMensagens, toggleAtivoStatus } =
    useMensagensWhatsAppStore();

  // Estados para o modal
  const [openModal, setOpenModal] = useState(false);
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const [edicao, setEdicao] = useState<EdicaoState>({
    id: '',
    status: '',
    mensagem: '',
    ativo: false
  });

  // Efeitos para carregar dados e mostrar notificações
  useEffect(() => {
    fetchMensagens().catch((err) => {
      showNotification(`Erro ao carregar mensagens: ${err.message}`, "error");
    });
  }, [fetchMensagens, showNotification]);

  useEffect(() => {
    if (error) {
      showNotification(`Erro: ${error}`, "error");
    }
  }, [error, showNotification]);

  // Funções de renderização
  const renderStatus = (status: string) => {
    let color: "success" | "error" | "warning" | "info" = "info";
    switch (status.toLowerCase()) {
      case "ativo":
      case "aprovado": color = "success"; break;
      case "inativo":
      case "rejeitado": color = "error"; break;
      case "pendente": color = "warning"; break;
    }
    return <Chip label={status} color={color} size="small" />;
  };

  const renderMensagem = (mensagem: string) => {
    const mensagemFormatada = mensagem.replace(
      /\{\{([^}]+)\}\}/g,
      (match, placeholder) =>
        `<span style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 4px; font-weight: bold;">{{${placeholder}}}</span>`
    );
    return <div dangerouslySetInnerHTML={{ __html: mensagemFormatada }} />;
  };

  const renderAtivoSwitch = (ativo: boolean) => (
    <FormControlLabel
      control={<Switch checked={ativo} readOnly color="primary" />}
      label={ativo ? "Ativo" : "Inativo"}
    />
  );

  // Funções de manipulação
  const handleToggleAtivo = async (id: string) => {
    try {
      await toggleAtivoStatus(id);
      showNotification("Status atualizado com sucesso", "success");
    } catch (error) {
      showNotification(
        `Erro ao atualizar status: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        "error"
      );
    }
  };

  const handleAbrirEdicao = (mensagem: MensagemWhatsApp) => {
    setEdicao({
      id: mensagem.Id,
      status: mensagem.Status,
      mensagem: mensagem.Mensagem,
      ativo: mensagem.Ativo
    });
    setOpenModal(true);
  };

  const handleFecharModal = () => {
    setOpenModal(false);
    setEdicao({
      id: '',
      status: '',
      mensagem: '',
      ativo: false
    });
  };

  const handleSalvarEdicao = async () => {
    setConfirmacaoAberta(true);
  };

  const confirmarSalvarEdicao = async () => {
    try {
      // Implemente aqui a chamada real à API
      // await atualizarMensagemAPI(edicao);
      
      showNotification("Mensagem atualizada com sucesso!", "success");
      handleFecharModal();
      fetchMensagens(); // Recarrega os dados
    } catch (error) {
      showNotification(
        `Erro ao atualizar mensagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        "error"
      );
    } finally {
      setConfirmacaoAberta(false);
    }
  };

  const handleCampoChange = (campo: keyof EdicaoState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | boolean
  ) => {
    const valor = typeof e === 'boolean' ? e : e.target.value;
    setEdicao(prev => ({ ...prev, [campo]: valor }));
  };

  const renderBotaoEditar = (row: MensagemWhatsApp) => (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<EditIcon />}
      onClick={() => handleAbrirEdicao(row)}
    >
      Editar
    </Button>
  );

  // Definição das colunas
  const colunas = [
    { id: "Status", label: "Status", format: (value: string) => renderStatus(value) },
    { id: "Mensagem", label: "Mensagem", format: (value: string) => renderMensagem(value), minWidth: 350 },
    { id: "Ativo", label: "Ativo", format: (value: boolean) => renderAtivoSwitch(value) },
    { id: "Ações", label: "Ações", format: (_: any, row: MensagemWhatsApp) => renderBotaoEditar(row)  },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Templates de Mensagens WhatsApp
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1">
          Gerencie os templates de mensagens WhatsApp. As mensagens podem conter
          placeholders como <strong>{"{{primeiroNome}}"}</strong>,{" "}
          <strong>{"{{numeroPedido}}"}</strong> ou{" "}
          <strong>{"{{dadosEntrega}}"}</strong> que serão substituídos pelos
          valores reais quando a mensagem for enviada.
        </Typography>
      </Paper>

      <CustomTable
        columns={colunas}
        data={mensagens}
        loading={loading}
        title="Templates de Mensagens"
        emptyMessage="Nenhum template de mensagem encontrado"
      />

      {/* Modal de Edição */}
      <Dialog open={openModal} onClose={handleFecharModal} maxWidth="md" fullWidth>
        <DialogTitle>Editar Mensagem</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              label="Status"
              fullWidth
              margin="normal"
              value={edicao.status}
              onChange={handleCampoChange('status')}
            />
            <TextField
              label="Mensagem"
              fullWidth
              multiline
              minRows={6}
              margin="normal"
              value={edicao.mensagem}
              onChange={handleCampoChange('mensagem')}
              helperText="Use {{placeholders}} para dados dinâmicos"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={edicao.ativo}
                  onChange={(e) => handleCampoChange('ativo')(e.target.checked)}
                  color="primary"
                />
              }
              label={edicao.ativo ? "Ativo" : "Inativo"}
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFecharModal}>Cancelar</Button>
          <Button
            onClick={handleSalvarEdicao}
            color="primary"
            variant="contained"
            disabled={!edicao.status || !edicao.mensagem}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação */}
      <Dialog open={confirmacaoAberta} onClose={() => setConfirmacaoAberta(false)}>
        <DialogTitle>Confirmar Edição</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja salvar as alterações?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmacaoAberta(false)}>Cancelar</Button>
          <Button onClick={confirmarSalvarEdicao} color="primary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MensagensWhatsApp;