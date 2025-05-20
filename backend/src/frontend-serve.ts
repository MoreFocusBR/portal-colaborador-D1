import path from 'path';
import express from 'express';

/**
 * Configura o Express para servir os arquivos estáticos do frontend React
 * @param app Instância do Express
 */
export const configureFrontendServing = (app: express.Application) => {
  // Configuração para servir arquivos estáticos do frontend
  app.use(express.static(path.join(__dirname, '../public')));

  // Rota para todas as requisições não-API retornarem o index.html
  app.get('*', (req, res) => {
    // Verifica se a requisição não é para a API
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    }
  });
};
