// /home/ubuntu/admin_project/d1-admin-main/frontend/src/components/OKR/ObjectiveCard.tsx
import React from 'react';
import { Box, Typography, LinearProgress, IconButton, Paper, Collapse, Tooltip } from '@mui/material';
import { Edit, Settings, ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

// Assuming types are similar to those in GestaoOKRPage.tsx or from a shared types file
interface KeyResult {
  id: string;
  title: string;
  responsible: string;
  currentValue: number;
  targetValue: number;
  status: string; // e.g., ON_TRACK, AT_RISK
  confidenceLevel: number;
  type: string; // e.g., PERCENTAGE, MONETARY
  unit?: string;
  notes?: string[];
  // Calculated progress for display
  progressPercentage?: number;
}

interface Objective {
  id: string;
  title: string;
  responsible: string;
  keyResults: KeyResult[];
  overallProgress?: number;
}

interface ObjectiveCardProps {
  objective: Objective;
  onEditObjective: (objectiveId: string) => void;
  onEditKeyResult: (objectiveId: string, keyResultId: string) => void;
  onDeleteObjective: () => Promise<void>;
  onAddKeyResult: () => void;
  onDeleteKeyResult: (krId: string) => Promise<void>;
}

const calculateKrProgress = (kr: KeyResult): number => {
  if (kr.targetValue === 0) return kr.currentValue > 0 ? 100 : 0;
  if (kr.type === 'BOOLEAN') return kr.currentValue >= kr.targetValue ? 100 : 0;
  return Math.min(Math.max((kr.currentValue / kr.targetValue) * 100, 0), 100);
};

const getProgressColor = (progress: number): 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info' => {
  if (progress < 30) return 'error';
  if (progress < 70) return 'warning';
  return 'success';
};

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, onEditObjective, onEditKeyResult }) => {
  const [expanded, setExpanded] = React.useState(true); // Default to expanded

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const overallObjectiveProgress = objective.overallProgress !== undefined ? objective.overallProgress : 0;

  return (
    <Paper elevation={2} sx={{ mb: 3, p: 2, borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleExpandClick}>
          {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          <Typography variant="h6" component="div" sx={{ ml: 1 }}>
            {objective.title}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2, display: 'inline' }}>
            {Math.round(overallObjectiveProgress)}%
          </Typography>
          <Tooltip title="Edit Objective">
            <IconButton size="small" onClick={() => onEditObjective(objective.id)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Objective Settings">
            <IconButton size="small">
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <LinearProgress variant="determinate" value={overallObjectiveProgress} color={getProgressColor(overallObjectiveProgress)} sx={{ height: '8px', borderRadius: '4px', mt: 1, mb: 1 }} />

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4, mt: 1 }}>
          {objective.keyResults.map(kr => {
            const krProgress = calculateKrProgress(kr);
            return (
              <Paper key={kr.id} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: '4px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1">{kr.title}</Typography>
                  <Box>
                    <Tooltip title={`Current: ${kr.currentValue}${kr.unit || ''} | Goal: ${kr.targetValue}${kr.unit || ''} | Progress: ${Math.round(krProgress)}%`}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: 'inline' }}>
                            {kr.type === 'MONETARY' && kr.unit === 'M' ? `$${kr.currentValue}M` : `${kr.currentValue}${kr.unit || ''}`}
                            {kr.type !== 'BOOLEAN' && ` / ${kr.targetValue}${kr.unit || ''}`}
                            {` (${Math.round(krProgress)}%)`}
                        </Typography>
                    </Tooltip>
                    <Tooltip title="Edit Key Result">
                      <IconButton size="small" onClick={() => onEditKeyResult(objective.id, kr.id)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                     <Tooltip title="Key Result Settings">
                        <IconButton size="small">
                            <Settings fontSize="small" />
                        </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <LinearProgress variant="determinate" value={krProgress} color={getProgressColor(krProgress)} sx={{ height: '6px', borderRadius: '3px', mt: 0.5 }} />
                <Typography variant="caption" display="block" color="text.secondary" sx={{mt: 0.5}}>
                  Responsible: {kr.responsible} | Confidence: {kr.confidenceLevel}% | Status: {kr.status}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ObjectiveCard;

