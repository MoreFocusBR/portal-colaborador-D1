import React from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'switch' | 'textarea';
  required?: boolean;
  options?: { value: string; label: string }[];
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  disabled?: boolean;
}

interface FormComponentProps {
  title?: string;
  fields: FormField[];
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (id: string, value: any) => void;
  onSubmit: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
  loading?: boolean;
}

const FormComponent: React.FC<FormComponentProps> = ({
  title,
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  submitButtonText = 'Salvar',
  cancelButtonText = 'Cancelar',
  onCancel,
  loading = false
}) => {
  const handleTextChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, event.target.value);
  };

  const handleSelectChange = (id: string) => (event: SelectChangeEvent) => {
    onChange(id, event.target.value);
  };

  const handleSwitchChange = (id: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(id, event.target.checked);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Paper sx={{ p: 3 }}>
      {title && (
        <>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {fields.map((field) => (
            <Grid
              item
              xs={12}
              sm={field.fullWidth === false ? 6 : 12}
              key={field.id}
            >
              {field.type === 'select' ? (
                <FormControl
                  fullWidth
                  error={!!errors[field.id]}
                  required={field.required}
                  disabled={field.disabled || loading}
                >
                  <InputLabel id={`${field.id}-label`}>{field.label}</InputLabel>
                  <Select
                    labelId={`${field.id}-label`}
                    id={field.id}
                    value={values[field.id] || ''}
                    label={field.label}
                    onChange={handleSelectChange(field.id)}
                  >
                    {field.options?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {(errors[field.id] || field.helperText) && (
                    <FormHelperText>{errors[field.id] || field.helperText}</FormHelperText>
                  )}
                </FormControl>
              ) : field.type === 'switch' ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!values[field.id]}
                      onChange={handleSwitchChange(field.id)}
                      name={field.id}
                      color="primary"
                      disabled={field.disabled || loading}
                    />
                  }
                  label={field.label}
                />
              ) : (
                <TextField
                  id={field.id}
                  name={field.id}
                  label={field.label}
                  type={field.type}
                  fullWidth
                  required={field.required}
                  value={values[field.id] || ''}
                  onChange={handleTextChange(field.id)}
                  error={!!errors[field.id]}
                  helperText={errors[field.id] || field.helperText}
                  multiline={field.multiline}
                  rows={field.rows}
                  disabled={field.disabled || loading}
                />
              )}
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outlined"
              disabled={loading}
            >
              {cancelButtonText}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : submitButtonText}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FormComponent;
