import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import useAuthStore from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [formErrors, setFormErrors] = useState<{email?: string, senha?: string}>({});
  
  const { login, loading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    const errors: {email?: string, senha?: string} = {};
    
    if (!email) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (!senha) {
      errors.senha = 'Senha é obrigatória';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Limpar erros
    setFormErrors({});
    
    // Realizar login
    await login(email, senha);
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        
        <Paper sx={{ p: 3, width: '100%', mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type="password"
              id="senha"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              error={!!formErrors.senha}
              helperText={formErrors.senha}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
