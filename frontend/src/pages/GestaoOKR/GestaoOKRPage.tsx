import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress, Alert, Button, Stack, IconButton, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ObjectiveCard from '../../components/OKR/ObjectiveCard';
import ObjectiveFormModal from '../../components/OKR/ObjectiveFormModal';
import KeyResultFormModal from '../../components/OKR/KeyResultFormModal';
import {
  getOkrOverview,
  getAllObjectives,
  createObjective as apiCreateObjective,
  updateObjective as apiUpdateObjective,
  deleteObjective as apiDeleteObjective,
  addKeyResult as apiAddKeyResult,
  updateKeyResult as apiUpdateKeyResult,
  removeKeyResult as apiRemoveKeyResult,
  Objective as ApiObjective,
  KeyResult as ApiKeyResult,
  KRType,
  KRStatus
} from '../../services/okrApiService';

export interface KeyResult {
  id: string;
  title: string;
  description: string; // Sempre garantimos valores não-undefined
  type: KRType;
  status: KRStatus;
  targetValue: number;
  currentValue: number;
  objectiveId: string;
  progressPercentage?: number;
  responsible: string;
  confidenceLevel: number;
  startDate: Date;
  endDate: Date;
  notes?: string[];
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  responsible: string;
  quarter: string;
  keyResults: KeyResult[];
  overallProgress: number;
  netConfidenceScore: number;
}

// Definindo explicitamente as props do ObjectiveCard para compatibilidade de tipo
interface ObjectiveCardProps {
  objective: Objective;
  onEditObjective: (objective: Objective) => void;
  onDeleteObjective: (objectiveId: string) => void;
  onAddKeyResult: (objectiveId: string) => void;
  onEditKeyResult: (kr: KeyResult | string) => void; // Aceita tanto KeyResult quanto string (ID)
  onDeleteKeyResult: (krId: string) => void;
}

// Interface correta para overviewMetrics
interface OkrOverviewMetrics {
  daysLeft: number;
  overallProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  netConfidenceScore: number;
}

function a11yProps(index: number) {
  return {
    id: `okr-tab-${index}`,
    'aria-controls': `okr-tabpanel-${index}`,
  };
}

const GestaoOKRPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [overviewMetrics, setOverviewMetrics] = useState<OkrOverviewMetrics | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentQuarter = "Q3 2024"; // This could be dynamic

  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

  const [isKrModalOpen, setIsKrModalOpen] = useState(false);
  const [editingKr, setEditingKr] = useState<KeyResult | null>(null);
  const [currentObjectiveIdForKr, setCurrentObjectiveIdForKr] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await getOkrOverview(currentQuarter);
      let objectivesData = await getAllObjectives(currentQuarter);
      const processedObjectives: Objective[] = objectivesData
        .filter(obj => obj.id && obj.title && obj.description && obj.quarter)
        .map(obj => ({
          id: obj.id!,
          title: obj.title!,
          description: obj.description!,
          responsible: obj.responsible!,
          quarter: obj.quarter!,
          keyResults: (obj.keyResults ?? []).map((kr: any) => ({
            id: kr.id,
            title: kr.title,
            // Garantir que description nunca seja undefined
            description: kr.description || '', // Providenciamos uma string vazia como fallback
            type: kr.type,
            status: kr.status,
            targetValue: kr.targetValue,
            currentValue: kr.currentValue || 0, // Valor padrão para currentValue
            objectiveId: kr.objectiveId,
            progressPercentage: kr.targetValue === 0 ? ((kr.currentValue ?? 0) > 0 ? 100 : 0) : Math.min(Math.max(((kr.currentValue ?? 0) / kr.targetValue) * 100, 0), 100),
            responsible: kr.responsible,
            confidenceLevel: kr.confidenceLevel,
            startDate: kr.startDate,
            endDate: kr.endDate,
            notes: kr.notes
          })),
          overallProgress: obj.overallProgress ?? 0,
          netConfidenceScore: obj.netConfidenceScore ?? 0
        }));
      setOverviewMetrics(overview);
      setObjectives(processedObjectives);
    } catch (err: any) {
      console.error("Failed to fetch OKR data", err);
      setError(err.response?.data?.message || "Falha ao carregar dados de OKR. Verifique a conexão com o servidor e tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [currentQuarter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenCreateObjectiveModal = () => {
    setEditingObjective(null);
    setIsObjectiveModalOpen(true);
  };

  const handleOpenEditObjectiveModal = (objective: Objective) => {
    setEditingObjective(objective);
    setIsObjectiveModalOpen(true);
  };

  const handleObjectiveFormSubmit = async (objectiveData: Omit<ApiObjective, 'id' | 'keyResults' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'netConfidenceScore'>) => {
    try {
      if (editingObjective && editingObjective.id) {
        await apiUpdateObjective(editingObjective.id, objectiveData);
      } else {
        await apiCreateObjective(objectiveData);
      }
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Failed to save objective", err);
      setError("Falha ao salvar objetivo.");
    }
  };
  
  const handleDeleteObjective = async (objectiveId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este objetivo e todos os seus resultados-chave?")) {
        try {
            await apiDeleteObjective(objectiveId);
            fetchData();
        } catch (err) {
            console.error("Failed to delete objective", err);
            setError("Falha ao excluir objetivo.");
        }
    }
  };

  const handleOpenCreateKrModal = (objectiveId: string) => {
    setEditingKr(null);
    setCurrentObjectiveIdForKr(objectiveId);
    setIsKrModalOpen(true);
  };

  const handleOpenEditKrModal = (kr: KeyResult | string, objectiveId: string) => {
    // Se kr for uma string (id), precisamos encontrar o KeyResult correspondente
    if (typeof kr === 'string') {
      // Encontrar o objetivo correto
      const objective = objectives.find(obj => obj.id === objectiveId);
      if (objective) {
        // Encontrar o KR correto usando o ID
        const keyResult = objective.keyResults.find(keyResult => keyResult.id === kr);
        if (keyResult) {
          setEditingKr(keyResult);
          setCurrentObjectiveIdForKr(objectiveId);
          setIsKrModalOpen(true);
          return;
        }
      }
      console.error(`Key Result with ID ${kr} not found`);
      return;
    }
    
    // Se kr já for um objeto KeyResult
    setEditingKr(kr);
    setCurrentObjectiveIdForKr(objectiveId);
    setIsKrModalOpen(true);
  };

  const handleKrFormSubmit = async (krData: Omit<ApiKeyResult, 'id' | 'objectiveId' | 'lastUpdated' | 'notes' | 'progressPercentage'>) => {
    if (!currentObjectiveIdForKr) return;
    try {
      if (editingKr) {
        await apiUpdateKeyResult(currentObjectiveIdForKr, editingKr.id, krData);
      } else {
        await apiAddKeyResult(currentObjectiveIdForKr, krData);
      }
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Failed to save key result", err);
      setError("Falha ao salvar resultado chave.");
    }
  };
  
  const handleDeleteKr = async (objectiveId: string, krId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este resultado-chave?")) {
        try {
            await apiRemoveKeyResult(objectiveId, krId);
            fetchData();
        } catch (err) {
            console.error("Failed to delete key result", err);
            setError("Falha ao excluir resultado chave.");
        }
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
  }

  // Error display should be prominent
  if (error) {
    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Alert severity="error" action={
                <Button color="inherit" size="small" onClick={fetchData}>
                    TENTAR NOVAMENTE
                </Button>
            }>
                {error}
            </Alert>
            {/* Optionally, display the rest of the UI in a disabled or limited state */}
        </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom component="div">
          OKRs da Empresa {currentQuarter}
        </Typography>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenCreateObjectiveModal}>
          Criar Objetivo
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="Abas de navegação OKR">
          <Tab label="RESULTADOS-CHAVE" {...a11yProps(0)} />
          <Tab label="MAPA" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {overviewMetrics && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} justifyContent="space-around" sx={{ mb: 4, p:2, backgroundColor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <Box textAlign="center">
            <Typography variant="h6">{overviewMetrics.daysLeft} dias restantes</Typography>
            <Typography variant="caption" color="text.secondary">Cronograma</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6">{Math.round(overviewMetrics.overallProgress)}%</Typography>
            <Typography variant="caption" color="text.secondary">Progresso geral</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6">{overviewMetrics.tasksCompleted}/{overviewMetrics.totalTasks}</Typography>
            <Typography variant="caption" color="text.secondary">Tarefas concluídas</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6">{Math.round(overviewMetrics.netConfidenceScore)} NCS</Typography>
            <Typography variant="caption" color="text.secondary">Índice de Confiança</Typography>
          </Box>
        </Stack>
      )}

      {currentTab === 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">DETALHES DO PLANO</Typography>
            <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small">Ocultar concluídos</Button>
                <Button variant="outlined" size="small">Expandir todos</Button>
                <Button variant="outlined" size="small">Recolher todos</Button>
            </Stack>
          </Stack>
          {objectives.length > 0 ? (
            objectives.map((obj) => (
              <ObjectiveCard 
                key={obj.id} 
                objective={obj} 
                onEditObjective={() => handleOpenEditObjectiveModal(obj)} 
                onDeleteObjective={() => handleDeleteObjective(obj.id)}
                onAddKeyResult={() => handleOpenCreateKrModal(obj.id)}
                onEditKeyResult={(kr) => handleOpenEditKrModal(kr, obj.id)} 
                onDeleteKeyResult={(krId) => handleDeleteKr(obj.id, krId)}
              />
            ))
          ) : (
            <Typography sx={{mt: 2, textAlign: 'center'}}>Nenhum objetivo encontrado para este trimestre. Clique em "Criar Objetivo" para adicionar um.</Typography>
          )}
        </Box>
      )}
      {currentTab === 1 && (
        <Box>
          <Typography variant="h6">Mapa de OKR</Typography>
          <Typography sx={{mt: 2, textAlign: 'center'}}>A visualização do mapa será implementada aqui.</Typography>
        </Box>
      )}

      <ObjectiveFormModal 
        open={isObjectiveModalOpen}
        onClose={() => setIsObjectiveModalOpen(false)}
        onSubmit={handleObjectiveFormSubmit}
        initialData={editingObjective}
        currentQuarter={currentQuarter}
      />

      {currentObjectiveIdForKr && (
        <KeyResultFormModal 
            open={isKrModalOpen}
            onClose={() => setIsKrModalOpen(false)}
            onSubmit={handleKrFormSubmit}
            initialData={editingKr}
            objectiveId={currentObjectiveIdForKr}
        />
      )}

    </Box>
  );
};

export default GestaoOKRPage;