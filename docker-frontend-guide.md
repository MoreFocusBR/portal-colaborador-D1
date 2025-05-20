# Guia de Acesso ao Frontend no Docker - Portal Colaborador D1

## Importante: O Frontend é Acessado pela Porta 3001

Na configuração Docker atual do Portal Colaborador D1, o frontend **não** é executado separadamente na porta 3000. Em vez disso, o build do React é servido pelo backend Node.js na **porta 3001**.

## Como Funciona

1. Durante o build do Docker:
   - O frontend React é compilado (npm run build)
   - Os arquivos estáticos gerados são copiados para a pasta `/app/public` no container
   - O backend Node.js é configurado para servir esses arquivos estáticos

2. Quando o container é executado:
   - O backend inicia na porta 3001
   - O frontend é servido como conteúdo estático pelo mesmo servidor
   - Todas as rotas não-API são redirecionadas para o index.html do React (SPA routing)

## Como Acessar a Aplicação

### Localmente

```bash
# Construir a imagem Docker
docker build -t portal-colaborador-d1 .

# Executar o container
docker run -p 3001:3001 -e DATABASE_URL=sua_url_db -e JWT_SECRET=seu_segredo portal-colaborador-d1

# Acessar a aplicação no navegador
# http://localhost:3001
```

### No Render.com

Após o deploy no Render.com, a aplicação estará disponível na URL fornecida pela plataforma, sem necessidade de especificar porta.

## Vantagens desta Abordagem

1. **Simplificação de Infraestrutura**: Um único container serve tanto o frontend quanto o backend
2. **Eliminação de Problemas de CORS**: Como ambos são servidos pelo mesmo origem, não há problemas de CORS
3. **Otimização de Recursos**: Menor consumo de recursos em comparação com dois serviços separados
4. **Compatibilidade com Render.com**: Funciona perfeitamente com as limitações do Render.com (um container por serviço)

## Solução de Problemas

Se você estiver tentando acessar o frontend na porta 3000 e encontrar erros, lembre-se:
- O frontend **não** está rodando na porta 3000
- Acesse a aplicação através da porta 3001: http://localhost:3001
- Todas as APIs continuam acessíveis em http://localhost:3001/api/...

## Desenvolvimento Local

Para desenvolvimento local (fora do Docker), você ainda pode executar o frontend na porta 3000 e o backend na porta 3001 separadamente:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

Neste caso, o frontend estará disponível em http://localhost:3000 e fará requisições para o backend em http://localhost:3001.
