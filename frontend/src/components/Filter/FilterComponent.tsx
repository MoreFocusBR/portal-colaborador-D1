import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Paper,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterProps {
  onFilter: (filters: any) => void;
  dateRangeFilter?: boolean;
  typeFilter?: boolean;
  typeOptions?: FilterOption[];
  statusFilter?: boolean;
  statusOptions?: FilterOption[];
  searchFilter?: boolean;
  searchPlaceholder?: string;
  additionalFilters?: React.ReactNode;
}

const FilterComponent: React.FC<FilterProps> = ({
  onFilter,
  dateRangeFilter = false,
  typeFilter = false,
  typeOptions = [],
  statusFilter = false,
  statusOptions = [],
  searchFilter = false,
  searchPlaceholder = 'Buscar...',
  additionalFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [type, setType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const handleTypeChange = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleFilter = () => {
    const filters = {
      ...(dateRangeFilter && startDate && { startDate }),
      ...(dateRangeFilter && endDate && { endDate }),
      ...(typeFilter && type && { type }),
      ...(statusFilter && status && { status }),
      ...(searchFilter && search && { search })
    };
    onFilter(filters);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setType('');
    setStatus('');
    setSearch('');
    onFilter({});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Filtros</Typography>
        <IconButton onClick={toggleFilters}>
          {showFilters ? <CloseIcon /> : <FilterListIcon />}
        </IconButton>
      </Box>

      {showFilters && (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <Grid container spacing={2}>
            {dateRangeFilter && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Data Inicial"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                  />
                </Grid>
              </>
            )}

            {typeFilter && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="type-select-label">Tipo</InputLabel>
                  <Select
                    labelId="type-select-label"
                    id="type-select"
                    value={type}
                    label="Tipo"
                    onChange={handleTypeChange}
                  >
                    <MenuItem value="">
                      <em>Todos</em>
                    </MenuItem>
                    {typeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {statusFilter && (
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={status}
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
            )}

            {searchFilter && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label={searchPlaceholder}
                  variant="outlined"
                  value={search}
                  onChange={handleSearchChange}
                />
              </Grid>
            )}

            {additionalFilters && (
              <Grid item xs={12}>
                {additionalFilters}
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleClear}>
                  Limpar
                </Button>
                <Button variant="contained" onClick={handleFilter}>
                  Aplicar Filtros
                </Button>
              </Box>
            </Grid>
          </Grid>
        </LocalizationProvider>
      )}
    </Paper>
  );
};

export default FilterComponent;
