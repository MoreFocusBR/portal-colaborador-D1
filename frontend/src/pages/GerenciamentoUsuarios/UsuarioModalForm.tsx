import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, Chip, Box, FormHelperText
} from '@mui/material';

interface GrupoOption {
  value: string;
  label: string;
}

interface UsuarioModalFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { nome: string; email: string; grupos: string[] }) => void;
  initialValues?: { nome: string; email: string; grupos: string[] };
  gruposOptions: GrupoOption[];
  loading?: boolean;
}

const UsuarioModalForm: React.FC<UsuarioModalFormProps> = ({
  open, onClose, onSave, initialValues, gruposOptions, loading
}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [grupos, setGrupos] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ nome?: string; email?: string }>({});

  useEffect(() => {
    setNome(initialValues?.nome || '');
    setEmail(initialValues?.email || '');
    setGrupos(initialValues?.grupos || []);
    setErrors({});
  }, [initialValues, open]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nome) newErrors.nome = 'Nome é obrigatório';
    if (!email) newErrors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'E-mail inválido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({ nome, email, grupos });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Usuário</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          fullWidth
          margin="normal"
          required
          error={!!errors.nome}
          helperText={errors.nome}
        />
        <TextField
          label="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
          error={!!errors.email}
          helperText={errors.email}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="grupos-label">Grupos</InputLabel>
          <Select
            labelId="grupos-label"
            multiple
            value={grupos}
            onChange={e => setGrupos(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => {
                  const label = gruposOptions.find(opt => opt.value === value)?.label || value;
                  return <Chip key={value} label={label} />;
                })}
              </Box>
            )}
          >
            {gruposOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Selecione um ou mais grupos</FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UsuarioModalForm; 