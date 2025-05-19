// /home/ubuntu/admin_project/d1-admin-main/frontend/src/components/OKR/KeyResultFormModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  OutlinedInput,
  InputAdornment
} from "@mui/material";
import { KeyResult, KRType, KRStatus } from "../../services/okrApiService"; // Assuming types are exported

interface KeyResultFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (krData: Omit<KeyResult, "id" | "objectiveId" | "lastUpdated" | "notes" | "progressPercentage">) => void;
  initialData?: KeyResult | null;
  objectiveId: string | null; // To associate KR with an objective
}

const KeyResultFormModal: React.FC<KeyResultFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  objectiveId,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [type, setType] = useState<KRType>(KRType.PERCENTAGE);
  const [targetValue, setTargetValue] = useState<number>(100);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState<string>("%");
  const [status, setStatus] = useState<KRStatus>(KRStatus.PLANNED);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() + 3))
      .toISOString()
      .split("T")[0]
  );
  const [confidenceLevel, setConfidenceLevel] = useState<number>(100);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setResponsible(initialData.responsible || "");
      setTargetValue(initialData.targetValue || 0);
      setCurrentValue(initialData.currentValue || 0);
      setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
      setEndDate(initialData.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0]);
      setConfidenceLevel(initialData.confidenceLevel || 100);
    } else {
      // Reset form for new KR
      setTitle("");
      setDescription("");
      setResponsible("");
      setType(KRType.PERCENTAGE);
      setTargetValue(100);
      setCurrentValue(0);
      setUnit("%");
      setStatus(KRStatus.PLANNED);
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split("T")[0]);
      setConfidenceLevel(100);
    }
  }, [initialData, open]);

  const handleTypeChange = (event: any) => {
    const newType = event.target.value as KRType;
    setType(newType);
    if (newType === KRType.PERCENTAGE) setUnit("%");
    else if (newType === KRType.CURRENCY) setUnit("USD"); // Default or let user specify
    else if (newType === KRType.BOOLEAN) { setUnit(""); setTargetValue(1); setCurrentValue(0); }
    else setUnit("");
  };

  const handleSubmit = () => {
    if (!title || !responsible || !objectiveId) {
      alert("Title, Responsible, and Objective ID are required.");
      return;
    }
    onSubmit({
      title,
      description,
      responsible,
      type,
      targetValue: Number(targetValue),
      currentValue: Number(currentValue),
      unit,
      status,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      confidenceLevel: Number(confidenceLevel),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initialData ? "Edit Key Result" : "Create New Key Result"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Key Result Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required />
          <TextField label="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={2} />
          <TextField label="Responsible (Team/Individual)" value={responsible} onChange={(e) => setResponsible(e.target.value)} fullWidth required />
          
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="kr-type-label">Type</InputLabel>
              <Select labelId="kr-type-label" value={type} label="Type" onChange={handleTypeChange}>
                {Object.values(KRType).map((krType) => (
                  <MenuItem key={krType} value={krType}>{krType.charAt(0) + krType.slice(1).toLowerCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="kr-status-label">Status</InputLabel>
              <Select labelId="kr-status-label" value={status} label="Status" onChange={(e) => setStatus(e.target.value as KRStatus)}>
                {Object.values(KRStatus).map((krStatus) => (
                  <MenuItem key={krStatus} value={krStatus}>{krStatus.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField 
                label="Current Value" 
                type="number" 
                value={currentValue} 
                onChange={(e) => setCurrentValue(parseFloat(e.target.value))} 
                fullWidth 
                InputProps={type === KRType.BOOLEAN ? { readOnly: true, value: currentValue >= 1 ? "Done" : "Not Done" } : {startAdornment: unit && type !== KRType.PERCENTAGE ? <InputAdornment position="start">{unit}</InputAdornment> : null, endAdornment: type === KRType.PERCENTAGE ? <InputAdornment position="end">%</InputAdornment> : null}}
            />
            <TextField 
                label="Target Value" 
                type="number" 
                value={targetValue} 
                onChange={(e) => setTargetValue(parseFloat(e.target.value))} 
                fullWidth 
                InputProps={type === KRType.BOOLEAN ? { readOnly: true, value: "Done" } : {startAdornment: unit && type !== KRType.PERCENTAGE ? <InputAdornment position="start">{unit}</InputAdornment> : null, endAdornment: type === KRType.PERCENTAGE ? <InputAdornment position="end">%</InputAdornment> : null}}
            />
            { type !== KRType.PERCENTAGE && type !== KRType.BOOLEAN && <TextField label="Unit (e.g., USD, tasks)" value={unit} onChange={(e) => setUnit(e.target.value)} fullWidth />}
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
          
          <TextField label="Confidence Level (0-100%)" type="number" value={confidenceLevel} onChange={(e) => setConfidenceLevel(Math.max(0, Math.min(100, parseInt(e.target.value))))} fullWidth InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
        
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">{initialData ? "Save Changes" : "Create Key Result"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyResultFormModal;

