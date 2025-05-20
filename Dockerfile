FROM node:20-alpine as backend-build

WORKDIR /app/backend

# Copiar apenas arquivos de dependências do backend
COPY backend/package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar apenas arquivos necessários do backend
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Compilar TypeScript do backend
RUN npm run build

# Estágio de build do frontend
FROM node:20-alpine as frontend-build

WORKDIR /app/frontend

# Copiar apenas arquivos de dependências do frontend
COPY frontend/package*.json ./

# Instalar dependências do frontend
RUN npm ci

# Copiar apenas arquivos necessários do frontend
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tsconfig.json ./

# Remover configuração específica do Windows nos scripts
RUN sed -i 's/set NODE_OPTIONS=--openssl-legacy-provider && //g' package.json

# Compilar o aplicativo React
RUN npm run build

# Estágio final - imagem mínima
FROM node:20-alpine as production

# Instalar serve para o frontend
RUN npm install -g serve

# Criar diretórios de trabalho
WORKDIR /app

# Copiar script de inicialização
COPY start-services.sh /app/start-services.sh
RUN chmod +x /app/start-services.sh

# Criar diretórios para backend e frontend
RUN mkdir -p /app/backend /app/frontend

# Copiar apenas arquivos compilados do backend
COPY --from=backend-build /app/backend/dist /app/backend/dist
COPY --from=backend-build /app/backend/package*.json /app/backend/

# Copiar arquivos compilados do frontend
COPY --from=frontend-build /app/frontend/build /app/frontend/build

# Instalar apenas dependências de produção com cache limpo
WORKDIR /app/backend
RUN npm ci --only=production && npm cache clean --force

# Expor ambas as portas
EXPOSE 3000 3001

# Variáveis de ambiente
ENV NODE_ENV=production

# Comando para iniciar ambos os serviços
CMD ["/app/start-services.sh"]
