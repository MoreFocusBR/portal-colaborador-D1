import React from 'react';
import { Typography, Container, Box, Paper, Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from 'react-router-dom';

const AcessoNegado: React.FC = () => {
  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate('/');
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <BlockIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography component="h1" variant="h4" gutterBottom>
          Acesso Negado
        </Typography>
        
        <Paper sx={{ p: 4, width: '100%', mt: 2 }}>
          <Typography variant="body1" paragraph>
            Você não tem permissão para acessar esta página. Seu perfil de usuário não possui as autorizações necessárias.
          </Typography>
          <Typography variant="body1" paragraph>
            Entre em contato com o administrador do sistema caso acredite que deveria ter acesso a este recurso.
          </Typography>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleVoltar}
            >
              Voltar para a página inicial
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AcessoNegado;
