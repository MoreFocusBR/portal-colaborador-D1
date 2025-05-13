import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Typography, Container, CssBaseline } from '@mui/material';

// Definição de tipo para as props do PlaceholderPage
interface PlaceholderPageProps {
  title: string;
}

// Componente temporário para as páginas
const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h4" component="h1" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1" paragraph>
      Esta página será implementada em breve.
    </Typography>
  </Box>
);

const App: React.FC = () => {
  return (
    <Router>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Sistema de Gestão
        </Typography>
        <Routes>
          <Route path="/" element={<PlaceholderPage title="Página Inicial" />} />
          <Route path="/transacoes" element={<PlaceholderPage title="Transações Financeiras" />} />
          <Route path="/mensagens-whatsapp" element={<PlaceholderPage title="Mensagens WhatsApp" />} />
          <Route path="/mensagens-email" element={<PlaceholderPage title="Mensagens E-mail" />} />
          <Route path="/usuarios" element={<PlaceholderPage title="Gerenciamento de Usuários" />} />
          <Route path="/grupos" element={<PlaceholderPage title="Grupos de Usuários" />} />
          <Route path="/vendas" element={<PlaceholderPage title="Vendas" />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
