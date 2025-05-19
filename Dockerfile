FROM node:20-alpine as backend-build

WORKDIR /app/backend

# Copiar arquivos de dependências do backend
COPY backend/package*.json ./

# Instalar dependências do backend
RUN npm install

# Copiar código fonte do backend
COPY backend/ ./

# Compilar TypeScript do backend
RUN npm run build

# Estágio de build do frontend
FROM node:20-alpine as frontend-build

WORKDIR /app/frontend

# Copiar arquivos de dependências do frontend
COPY frontend/package*.json ./

# Instalar dependências do frontend
RUN npm install

# Copiar código fonte do frontend
COPY frontend/ ./

# Remover configuração específica do Windows nos scripts
RUN sed -i 's/set NODE_OPTIONS=--openssl-legacy-provider && //g' package.json

# Compilar o aplicativo React
RUN npm run build

# Estágio final
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos compilados do backend
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package*.json ./

# Copiar arquivos compilados do frontend para pasta pública do backend
COPY --from=frontend-build /app/frontend/build ./public

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Expor porta
EXPOSE 3001

# Variáveis de ambiente
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
