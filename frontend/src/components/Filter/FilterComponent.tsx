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
import { ptBR } from 'date-fns/locale/pt-BR';
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
        <IconButton onClick={toggleFilters} aria-label={showFilters ? 'Fechar filtros' : 'Abrir filtros'}>
          {showFilters ? <CloseIcon /> : <FilterListIcon />}
        </IconButton>
      </Box>

      
    </Paper>
  );
};

export default FilterComponent;