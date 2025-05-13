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
  Button
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
import AppProvider from './components/AppProvider/AppProvider';
import TransacoesFinanceiras from './pages/TransacoesFinanceiras/TransacoesFinanceiras';
import MensagensWhatsApp from './pages/MensagensWhatsApp/MensagensWhatsApp';
import MensagensEmail from './pages/MensagensEmail/MensagensEmail';
import GerenciamentoUsuarios from './pages/GerenciamentoUsuarios/GerenciamentoUsuarios';
import GruposUsuarios from './pages/GruposUsuarios/GruposUsuarios';
import TelaVendas from './pages/Vendas/TelaVendas';
import Login from './pages/Login/Login';
import AcessoNegado from './pages/AcessoNegado/AcessoNegado';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import useAuthStore from './store/authStore';

const App: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { isAuthenticated, usuario, logout } = useAuthStore();
  const theme = useTheme();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

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
                    Sistema de Gestão
                  </Typography>
                  {usuario && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ mr: 2 }}>
                        Olá, {usuario.nome}
                      </Typography>
                      <Button 
                        color="inherit" 
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                      >
                        Sair
                      </Button>
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
                  <ListItem button component={React.forwardRef<HTMLAnchorElement, any>((props, ref) => <Link {...props} ref={ref} to="/transacoes" />)}>
                    <ListItemIcon>
                      <AttachMoneyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Transações Financeiras" />
                  </ListItem>
                  <ListItem button component={React.forwardRef<HTMLAnchorElement, any>((props, ref) => <Link {...props} ref={ref} to="/mensagens-whatsapp" />)}>
                    <ListItemIcon>
                      <WhatsAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Mensagens WhatsApp" />
                  </ListItem>
                  <ListItem button component={React.forwardRef<HTMLAnchorElement, any>((props, ref) => <Link {...props} ref={ref} to="/mensagens-email" />)}>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText primary="Mensagens E-mail" />
                  </ListItem>
                  <ListItem button component={React.forwardRef<HTMLAnchorElement, any>((props, ref) => <Link {...props} ref={ref} to="/usuarios" />)}>
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Gerenciamento de Usuários" />
                  </ListItem>
                  <ListItem button component={React.forwardRef<HTMLAnchorElement, any>((props, ref) => <Link {...props} ref={ref} to="/grupos" />)}>
                    <ListItemIcon>
                      <GroupsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Grupos de Usuários" />
                  </ListItem>
                  <ListItem button component={React.forwardRef<HTMLAnchorElement, any>((props, ref) => <Link {...props} ref={ref} to="/vendas" />)}>
                    <ListItemIcon>
                      <ShoppingCartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Vendas" />
                  </ListItem>
                </List>
              </Drawer>
            </>
          )}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: isAuthenticated ? `calc(100% - ${open ? 240 : 72}px)` : '100%' },
              marginLeft: { sm: isAuthenticated ? `${open ? 240 : 72}px` : 0 },
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
                  <ProtectedRoute telaId="transacoes">
                    <TransacoesFinanceiras />
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
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </AppProvider>
  );
};

export default App;
