import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Container,
  CssBaseline,
  Button,
  Chip,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutIcon from '@mui/icons-material/Logout';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EventIcon from '@mui/icons-material/Event'; // Ícone para Gestão de Eventos
import AppProvider from './components/AppProvider/AppProvider';
import Dashboard from './pages/Dashboard/Dashboard';
import TransacoesFinanceiras from './pages/TransacoesFinanceiras/TransacoesFinanceiras';
import MensagensWhatsApp from './pages/MensagensWhatsApp/MensagensWhatsApp';
import MensagensEmail from './pages/MensagensEmail/MensagensEmail';
import GerenciamentoUsuarios from './pages/GerenciamentoUsuarios/GerenciamentoUsuarios';
import GruposUsuarios from './pages/GruposUsuarios/GruposUsuarios';
import TelaVendas from './pages/Vendas/TelaVendas';
import GestaoEventos from './pages/GestaoEventos/GestaoEventos'; // Importar a nova tela
import Login from './pages/Login/Login';
import AcessoNegado from './pages/AcessoNegado/AcessoNegado';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import useAuthStore from './store/authStore';
import { getAuthToken } from "./utils/auth";

const telasDisponiveis = [
  { id: 'transacoes', nome: 'Transações Financeiras' },
  { id: 'mensagens-whatsapp', nome: 'Mensagens WhatsApp' },
  { id: 'mensagens-email', nome: 'Mensagens E-mail' },
  { id: 'usuarios', nome: 'Gerenciamento de Usuários' },
  { id: 'grupos', nome: 'Grupos de Usuários' },
  { id: 'vendas', nome: 'Vendas' },
  { id: 'gestao-eventos', nome: 'Gestão de Eventos' } // Adicionar nova tela
];

const App: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { isAuthenticated, usuario, logout, permissoes } = useAuthStore();
  const theme = useTheme();
  const isSmallScreen = theme.breakpoints.down('sm');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openSenhaModal, setOpenSenhaModal] = React.useState(false);
  const [novaSenha, setNovaSenha] = React.useState('');
  const [confirmarSenha, setConfirmarSenha] = React.useState('');
  const [erroSenha, setErroSenha] = React.useState('');

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleAbrirModalSenha = () => {
    setOpenSenhaModal(true);
    handleMenuClose();
  };

  const handleFecharModalSenha = () => {
    setOpenSenhaModal(false);
    setNovaSenha('');
    setConfirmarSenha('');
    setErroSenha('');
  };

  const handleSalvarSenha = async () => {
    if (!novaSenha || novaSenha !== confirmarSenha) {
      setErroSenha('As senhas não coincidem');
      return;
    }
    setErroSenha('');
    // Chame o endpoint de alteração de senha aqui
    try {
      const userId = usuario?.id;
      const token = getAuthToken();
      const resp = await fetch(`http://localhost:3001/usuarios/${userId}/senha`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ senha: novaSenha })
      });
      if (!resp.ok) {
        setErroSenha('Erro ao alterar senha');
        return;
      }
      handleFecharModalSenha();
      // Opcional: mostrar notificação de sucesso
    } catch {
      setErroSenha('Erro ao alterar senha');
    }
  };

  const renderTelasPermitidas = (telasIds: string[] = []) => {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {(Array.isArray(telasIds) ? telasIds : []).map(telaId => {
          const tela = telasDisponiveis.find(t => t.id === telaId);
          return (
            <Chip 
              key={telaId} 
              label={tela ? tela.nome : telaId} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          );
        })}
      </Box>
    );
  };

  const menuItems = [
    { telaId: 'transacoes', label: 'Transações Financeiras', icon: <AttachMoneyIcon />, to: '/transacoes' },
    { telaId: 'mensagens-whatsapp', label: 'Mensagens WhatsApp', icon: <WhatsAppIcon />, to: '/mensagens-whatsapp' },
    { telaId: 'mensagens-email', label: 'Mensagens E-mail', icon: <EmailIcon />, to: '/mensagens-email' },
    { telaId: 'usuarios', label: 'Gerenciamento de Usuários', icon: <PeopleIcon />, to: '/usuarios' },
    { telaId: 'grupos', label: 'Grupos de Usuários', icon: <GroupsIcon />, to: '/grupos' },
    { telaId: 'vendas', label: 'Vendas', icon: <ShoppingCartIcon />, to: '/vendas' },
    { telaId: 'gestao-eventos', label: 'Gestão de Eventos', icon: <EventIcon />, to: '/gestao-eventos' } // Adicionar novo item de menu
  ];

  const menuItemsPermitidos = menuItems.filter(item => permissoes.includes(item.telaId));

  return (
    <AppProvider>
      <Router>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          {isAuthenticated && (
            <>
              <AppBar
                position="fixed"
                sx={{
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                  transition: (theme) =>
                    theme.transitions.create(['width', 'margin'], {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.leavingScreen,
                    }),
                  ...(open && {
                    marginLeft: 240,
                    width: `calc(100% - 240px)`,
                    transition: (theme) =>
                      theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                      }),
                  }),
                }}
              >
                <Toolbar>
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{
                      marginRight: 5,
                      ...(open && { display: 'none' }),
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    D1FITNESS - Portal do Colaborador
                  </Typography>
                  {usuario && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body1"
                        sx={{ mr: 2, cursor: 'pointer' }}
                        onClick={handleMenuOpen}
                      >
                        Olá, {usuario.nome}
                      </Typography>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={handleAbrirModalSenha}>Alterar Senha</MenuItem>
                        <MenuItem onClick={handleLogout}>Sair</MenuItem>
                      </Menu>
                    </Box>
                  )}
                </Toolbar>
              </AppBar>
              <Drawer
                variant="permanent"
                open={open}
                sx={{
                  width: 240,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    ...(open ? {
                      transition: (theme) =>
                        theme.transitions.create('width', {
                          easing: theme.transitions.easing.sharp,
                          duration: theme.transitions.duration.enteringScreen,
                        }),
                    } : {
                      overflowX: 'hidden',
                      transition: (theme) =>
                        theme.transitions.create('width', {
                          easing: theme.transitions.easing.sharp,
                          duration: theme.transitions.duration.leavingScreen,
                        }),
                      width: (theme) => theme.spacing(7),
                      [theme.breakpoints.up('sm')]: {
                        width: (theme) => theme.spacing(9),
                      },
                    }),
                  },
                }}
              >
                <Toolbar
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                  }}
                >
                  <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                  </IconButton>
                </Toolbar>
                <Divider />
                <List>
                  {menuItemsPermitidos.map(item => (
                    <ListItem key={item.telaId} component={Link} to={item.to}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            </>
          )}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: isSmallScreen ? '100%' : `calc(100%)`,
              marginLeft: '-180px',
              transition: (theme) =>
                theme.transitions.create(['width', 'margin'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
            }}
          >
            {isAuthenticated && <Toolbar />}
            <Container maxWidth="xl">
              <Routes>
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/acesso-negado" element={<AcessoNegado />} />
                
                <Route path="/" element={
                  <ProtectedRoute telaId="tela-inicial" > {/* Default route */} 
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/transacoes" element={
                  <ProtectedRoute telaId="transacoes">
                    <TransacoesFinanceiras />
                  </ProtectedRoute>
                } />
                
                <Route path="/mensagens-whatsapp" element={
                  <ProtectedRoute telaId="mensagens-whatsapp">
                    <MensagensWhatsApp />
                  </ProtectedRoute>
                } />
                
                <Route path="/mensagens-email" element={
                  <ProtectedRoute telaId="mensagens-email">
                    <MensagensEmail />
                  </ProtectedRoute>
                } />
                
                <Route path="/usuarios" element={
                  <ProtectedRoute telaId="usuarios">
                    <GerenciamentoUsuarios />
                  </ProtectedRoute>
                } />
                
                <Route path="/grupos" element={
                  <ProtectedRoute telaId="grupos">
                    <GruposUsuarios />
                  </ProtectedRoute>
                } />
                
                <Route path="/vendas" element={
                  <ProtectedRoute telaId="vendas">
                    <TelaVendas />
                  </ProtectedRoute>
                } />

                <Route path="/gestao-eventos" element={ // Adicionar nova rota
                  <ProtectedRoute telaId="gestao-eventos">
                    <GestaoEventos />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </Box>
        </Box>
        <Dialog open={openSenhaModal} onClose={handleFecharModalSenha}>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogContent>
            <TextField
              label="Nova Senha"
              type="password"
              fullWidth
              margin="normal"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
            />
            <TextField
              label="Confirmar Nova Senha"
              type="password"
              fullWidth
              margin="normal"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              error={!!erroSenha}
              helperText={erroSenha}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFecharModalSenha}>Cancelar</Button>
            <Button onClick={handleSalvarSenha} variant="contained">Salvar</Button>
          </DialogActions>
        </Dialog>
      </Router>
    </AppProvider>
  );
};

export default App;

