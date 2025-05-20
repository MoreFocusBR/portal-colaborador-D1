import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Paper,
  SelectChangeEvent,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale/pt-BR";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

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
  docPagadorFilter?: boolean;
  pagadorFilter?: boolean;
  valorFilter?: boolean;
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
  searchPlaceholder = "Buscar...",
  docPagadorFilter = false, // Valor padrão
  pagadorFilter = false, // Valor padrão
  valorFilter = false, // Valor padrão
  additionalFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [docPagador, setDocPagador] = useState<string>("");
  const [pagador, setPagador] = useState<string>("");
  const [valor, setValor] = useState<string>("");

  const handleTypeChange = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleDocPagadorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDocPagador(event.target.value);
  };

  const handlePagadorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagador(event.target.value);
  };

  const handleValorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValor(event.target.value);
  };

  const handleFilter = () => {
    const filters = {
      ...(dateRangeFilter && startDate && { startDate }),
      ...(dateRangeFilter && endDate && { endDate }),
      ...(typeFilter && type && { type }),
      ...(statusFilter && status && { status }),
      ...(searchFilter && search && { search }),
      ...(docPagadorFilter && docPagador && { docPagador }),
      ...(pagadorFilter && pagador && { pagador }),
      ...(valorFilter && valor && { valor }),
    };
    onFilter(filters);
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setType("");
    setStatus("");
    setSearch("");
    setDocPagador("");
    setPagador("");
    setValor("");
    onFilter({});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Filtros</Typography>
        <IconButton
          onClick={toggleFilters}
          aria-label={showFilters ? "Fechar filtros" : "Abrir filtros"}
        >
          {showFilters ? <CloseIcon /> : <FilterListIcon />}
        </IconButton>
      </Box>
      {showFilters && (
        <Box component="form" noValidate autoComplete="off">
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" alignItems="flex-start">
            {dateRangeFilter && (
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: {xs: '100%', md: 'auto'} }}>
                  <DatePicker
                    label="Data Inicial"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined', sx:{minWidth: 220} } }}
                  />
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true, variant: 'outlined', sx:{minWidth: 220} } }}
                  />
                </Stack>
              </LocalizationProvider>
            )}

            {searchFilter && (
              <TextField
                label={searchPlaceholder}
                value={search}
                onChange={handleSearchChange}
                variant="outlined"
                sx={{ minWidth: 220, flexGrow: 1 }}
              />
            )}
            
            {docPagadorFilter && (
              <TextField
                label="Doc. Pagador"
                value={docPagador}
                onChange={handleDocPagadorChange}
                variant="outlined"
                sx={{ minWidth: 220, flexGrow: 1 }}
              />
            )}

            {pagadorFilter && (
              <TextField
                label="Pagador"
                value={pagador}
                onChange={handlePagadorChange}
                variant="outlined"
                sx={{ minWidth: 220, flexGrow: 1 }}
              />
            )}

            {valorFilter && (
              <TextField
                label="Valor"
                value={valor}
                onChange={handleValorChange}
                variant="outlined"
                type="number"
                sx={{ minWidth: 220, flexGrow: 1 }}
              />
            )}

            {typeFilter && (
              <FormControl variant="outlined" sx={{ minWidth: 220, flexGrow: 1 }}>
                <InputLabel id="type-filter-select-label">Tipo</InputLabel>
                <Select
                  labelId="type-filter-select-label"
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
            )}

            {statusFilter && (
              <FormControl variant="outlined" sx={{ minWidth: 220, flexGrow: 1 }}>
                <InputLabel id="status-filter-select-label">Status</InputLabel>
                <Select
                  labelId="status-filter-select-label"
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
            )}
            
            {additionalFilters}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt:1 }}>
            <Button variant="outlined" onClick={handleClear} sx={{ mr: 1 }}>
              Limpar
            </Button>
            <Button variant="contained" onClick={handleFilter}>
              Filtrar
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default FilterComponent;
