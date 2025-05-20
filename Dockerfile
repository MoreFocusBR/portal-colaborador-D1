FROM node:20-alpine as backend-build

WORKDIR /app/backend

# Copiar apenas arquivos de dependências do backend
COPY backend/package*.json ./

# Instalar apenas dependências de produção
RUN npm ci

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


# Etapa final
FROM node:20-alpine as production
WORKDIR /app

# Copiar backend
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/package*.json ./backend/
# Copiar frontend buildado para pasta servida pelo Express
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Instalar dependências do backend
WORKDIR /app/backend
RUN npm ci --only=production && npm cache clean --force

# Expor somente a porta do backend
EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]