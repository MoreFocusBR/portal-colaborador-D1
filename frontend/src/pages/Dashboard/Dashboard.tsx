import React, { useState, useEffect } from 'react';
import { eventoService, Evento } from '../../services/eventoService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  IconButton,
  ButtonBase
} from '@mui/material';
import {
  MonetizationOn,
  ShoppingCart,
  Description,
  People,
  Timer,
  Cake,
  Link as LinkIcon,
  KeyboardArrowRight
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarEventos = async () => {
      try {
        const eventosData = await eventoService.listarEventos();
        setEventos(eventosData);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarEventos();
  }, []);

  const objetivosEstrategicos = [
    {
      titulo: "EXCELÊNCIA EM VENDAS",
      indicadores: [
        { nome: "RECEITA TOTAL", valor: 68 },
        { nome: "NPS EXTERNO", valor: 90 }
      ],
      cor: "#ff571f"
    },
    {
      titulo: "AUMENTAR A RENTABILIDADE",
      indicadores: [
        { nome: "TAMANHO DA EMPRESA", valor: 75 },
        { nome: "EFICIÊNCIA OPERACIONAL", valor: 82 }
      ],
      cor: "#4CAF50"
    },
    {
      titulo: "EXCELENTE LUGAR PARA TRABALHAR",
      indicadores: [
        { nome: "NPS INTERNO", valor: 85 },
        { nome: "ÍNDICE DE PRODUTIVIDADE", valor: 72 }
      ],
      cor: "#2196F3"
    }
  ];

  const aniversariantes = [
    { nome: "Maria Silva", data: "15/05" },
    { nome: "João Santos", data: "17/05" },
    { nome: "Ana Costa", data: "18/05" }
  ];

  const acessosRapidos = [
    { titulo: "Solicitações", link: "/solicitacoes", icone: <Description /> },
    { titulo: "Cadastros", link: "/cadastros", icone: <People /> },
    { titulo: "Relatórios", link: "/relatorios", icone: <Description /> }
  ];

  const indicadoresHoje = {
    vendasTotal: 15780.50,
    numeroPedidos: 23
  };

  const eventosFormatados = eventos.map(evento => ({
    data: new Date(evento.data).toLocaleDateString('pt-BR'),
    titulo: evento.titulo,
    horario: evento.hora
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Objetivos Estratégicos */}
        <Grid size={{ xs: 12 }} component="div">
          <Typography variant="h5" gutterBottom>
            Objetivos e Indicadores Estratégicos: T2 2025
          </Typography>
          <Grid container spacing={2}>
            {objetivosEstrategicos.map((objetivo, index) => (
              <Grid size={{ xs: 12, md: 4 }} component="div" key={index}>
                <Paper sx={{ p: 2, bgcolor: `${objetivo.cor}15` }}>
                  <Typography variant="h6" gutterBottom sx={{ color: objetivo.cor }}>
                    {objetivo.titulo}
                  </Typography>
                  {objetivo.indicadores.map((indicador, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        {indicador.nome}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={indicador.valor}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              bgcolor: `${objetivo.cor}30`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: objetivo.cor
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: objetivo.cor }}>
                          {indicador.valor}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Grid container spacing={2}>
            {/* Indicadores do Dia */}
            <Grid size={{ xs: 12}} component="div">
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Resultados de Hoje
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }} component="div">
                    <Card sx={{ bgcolor: 'primary.light' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="white">
                          Total em Vendas
                        </Typography>
                        <Typography variant="h5" color="white">
                          R$ {indicadoresHoje.vendasTotal.toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6 }} component="div">
                    <Card sx={{ bgcolor: 'secondary.light' }}>
                      <CardContent>
                        <Typography variant="subtitle2" color="white">
                          Número de Pedidos
                        </Typography>
                        <Typography variant="h5" color="white">
                          {indicadoresHoje.numeroPedidos}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Acessos Rápidos */}
            <Grid size={{ xs: 12 }} component="div">
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Acesso Rápido
                </Typography>
                <Grid container spacing={2}>
                  {acessosRapidos.map((acesso, index) => (
                    <Grid size={{ xs: 12, md: 4 }} component="div" key={index}>
                      <ButtonBase
                        sx={{
                          width: '100%',
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          textAlign: 'left',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {acesso.icone}
                          <Typography sx={{ ml: 2, flexGrow: 1 }}>{acesso.titulo}</Typography>
                          <KeyboardArrowRight />
                        </Box>
                      </ButtonBase>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            </Grid>
        </Grid>

        {/* Eventos e Aniversários */}
        <Grid size={{ xs: 12, md: 6 }} component="div">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12}} component="div">
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Próximos Eventos
                </Typography>
                <List>
                  {loading ? (
                    <ListItem>
                      <ListItemText primary="Carregando eventos..." />
                    </ListItem>
                  ) : eventosFormatados.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="Nenhum evento próximo" />
                    </ListItem>
                  ) : (
                    eventosFormatados.map((evento, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={evento.titulo}
                          secondary={`${evento.data} às ${evento.horario}`}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12}} component="div">
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Próximos Aniversários
                </Typography>
                <List>
                  {aniversariantes.map((aniversariante, index) => (
                    <ListItem key={index}>
                      <Cake sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={aniversariante.nome}
                        secondary={aniversariante.data}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        
      </Grid>
    </Box>
  );
};

export default Dashboard;