#!/bin/sh

# Script para iniciar frontend e backend simultaneamente
# Autor: Manus
# Data: 20/05/2025

# Configurar variáveis de ambiente
export NODE_ENV=production

# Iniciar o backend em segundo plano
echo "Iniciando backend na porta 3001..."
cd /app/backend && node dist/index.js &
BACKEND_PID=$!

# Iniciar o frontend
echo "Iniciando frontend na porta 3000..."
cd /app/frontend && npx serve -s build -l 3000 &
FRONTEND_PID=$!

# Função para encerrar processos ao receber sinal
cleanup() {
    echo "Encerrando serviços..."
    kill -TERM $BACKEND_PID 2>/dev/null
    kill -TERM $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar sinais para encerramento limpo
trap cleanup SIGINT SIGTERM

# Manter script em execução
echo "Serviços iniciados. Pressione Ctrl+C para encerrar."
wait
