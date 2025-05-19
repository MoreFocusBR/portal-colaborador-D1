# Guia de Publicação Docker no Render.com - Portal Colaborador D1

Este guia apresenta o passo a passo para configurar e publicar o projeto Portal Colaborador D1 na plataforma Render.com utilizando Docker. Como o Render.com não suporta múltiplos containers via docker-compose, este guia foca em uma abordagem monolítica onde frontend e backend são servidos pelo mesmo container.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Estrutura do Dockerfile Monolítico](#estrutura-do-dockerfile-monolítico)
3. [Publicação no Render.com](#publicação-no-rendercom)
4. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
5. [Alternativas de Publicação](#alternativas-de-publicação)
6. [Monitoramento e Manutenção](#monitoramento-e-manutenção)

## Pré-requisitos

Antes de iniciar o processo de publicação, certifique-se de ter:

- Uma conta no Render.com
- Acesso ao repositório GitHub: https://github.com/MoreFocusBR/portal-colaborador-D1.git
- Informações de conexão com o banco de dados PostgreSQL
- Docker instalado localmente (para testes)

## Estrutura do Dockerfile Monolítico

O Dockerfile criado utiliza uma abordagem multi-estágio para:
1. Compilar o backend (Node.js/TypeScript)
2. Compilar o frontend (React)
3. Criar uma imagem final que serve o frontend através do backend

### Explicação do Dockerfile

```dockerfile
# Estágio 1: Build do Backend
FROM node:20-alpine as backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Estágio 2: Build do Frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN sed -i 's/set NODE_OPTIONS=--openssl-legacy-provider && //g' package.json
RUN npm run build

# Estágio 3: Imagem Final
FROM node:20-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package*.json ./
COPY --from=frontend-build /app/frontend/build ./public
RUN npm ci --only=production
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

### Ajustes Necessários no Backend

Para que o backend sirva os arquivos estáticos do frontend, é necessário adicionar o seguinte código ao arquivo `backend/src/index.ts`:

```typescript
// Adicione estas linhas ao arquivo index.ts
import path from 'path';

// Configuração para servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../public')));

// Rota para todas as requisições não-API retornarem o index.html
app.get('*', (req, res) => {
  // Verifica se a requisição não é para a API
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});
```

## Publicação no Render.com

### 1. Teste Local (Opcional)

Antes de publicar no Render.com, você pode testar localmente:

```bash
# Na raiz do projeto
docker build -t portal-colaborador-d1 .
docker run -p 3001:3001 -e DATABASE_URL=sua_url_db -e JWT_SECRET=seu_segredo portal-colaborador-d1
```

### 2. Criação do Serviço Web no Render.com

1. Acesse o dashboard do Render.com e faça login
2. Clique em "New +" e selecione "Web Service"
3. Conecte sua conta GitHub e selecione o repositório `portal-colaborador-D1`
4. Configure o serviço:
   - **Nome**: `portal-colaborador-d1` (ou outro nome de sua preferência)
   - **Região**: Escolha a região mais próxima dos seus usuários
   - **Branch**: `main` (ou a branch que deseja publicar)
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile` (caminho relativo ao Dockerfile na raiz)
   - **Plan**: Escolha o plano adequado (Free é suficiente para testes)

5. Em "Advanced", configure as variáveis de ambiente necessárias (veja a seção [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente))

6. Clique em "Create Web Service"

O Render iniciará o processo de build e deploy do seu aplicativo. Este processo pode levar alguns minutos.

## Configuração de Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no serviço do Render:

- `NODE_ENV`: `production`
- `PORT`: Deixe em branco (o Render configura automaticamente)
- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `JWT_SECRET`: Chave secreta para geração de tokens JWT
- Outras variáveis específicas do seu projeto conforme necessário

## Alternativas de Publicação

### Opção 1: Serviços Separados

Se preferir manter frontend e backend separados, você pode criar dois serviços no Render:

1. **Backend**: Serviço Web com o Dockerfile da pasta backend
2. **Frontend**: Static Site com o Dockerfile da pasta frontend

Neste caso, você precisará configurar o CORS no backend e definir a URL da API no frontend.

### Opção 2: Render Blueprint (render.yaml)

O Render suporta a definição de múltiplos serviços via arquivo `render.yaml`. Exemplo:

```yaml
services:
  - type: web
    name: portal-colaborador-d1-backend
    env: docker
    dockerfilePath: ./backend/Dockerfile
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false

  - type: web
    name: portal-colaborador-d1-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://portal-colaborador-d1-backend.onrender.com
```

## Monitoramento e Manutenção

### Logs e Monitoramento

O Render oferece ferramentas para monitorar seu serviço:

1. Acesse o dashboard do serviço
2. Clique na aba "Logs" para visualizar os logs em tempo real
3. Configure alertas em "Monitoring" para ser notificado sobre problemas

### Atualizações

Para atualizar sua aplicação:

1. Faça push das alterações para o repositório GitHub
2. O Render detectará automaticamente as mudanças e iniciará um novo deploy
3. Alternativamente, você pode acionar um deploy manual clicando em "Manual Deploy" > "Deploy latest commit"

### Escalonamento

Se necessário, você pode escalonar seu serviço:

1. Acesse o dashboard do serviço
2. Clique em "Settings" > "Plan"
3. Selecione um plano com mais recursos

## Solução de Problemas Comuns

### Erro no Build do Docker

- Verifique os logs de build para identificar o problema
- Certifique-se de que todas as dependências estão listadas no package.json
- Verifique se os scripts de build estão configurados corretamente

### Problemas com Banco de Dados

- Verifique se a variável `DATABASE_URL` está configurada corretamente
- Certifique-se de que o banco de dados está acessível a partir do Render
- Verifique se as migrações de banco de dados foram executadas

### Frontend não Carrega Corretamente

- Verifique se o backend está servindo corretamente os arquivos estáticos
- Inspecione os logs para erros relacionados a rotas ou arquivos estáticos
- Verifique se o caminho para o index.html está correto

---

Este guia fornece as instruções para publicar o Portal Colaborador D1 no Render.com utilizando Docker. Ajustes específicos podem ser necessários dependendo das particularidades do seu projeto.
