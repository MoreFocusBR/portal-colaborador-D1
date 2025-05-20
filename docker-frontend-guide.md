# Guia de Acesso ao Portal Colaborador D1 no Docker

## Configuração Atualizada: Frontend na porta 3000 e Backend na porta 3001

Na configuração Docker atual do Portal Colaborador D1, o frontend e o backend são executados simultaneamente no mesmo container:

- **Frontend React**: Acessível na porta 3000
- **Backend Node.js**: Acessível na porta 3001

## Como Funciona

1. Durante o build do Docker:
   - O backend Node.js é compilado (TypeScript para JavaScript)
   - O frontend React é compilado (npm run build)
   - Ambos os builds são copiados para diretórios específicos no container final

2. Quando o container é executado:
   - Um script de inicialização (start-services.sh) inicia ambos os serviços
   - O backend é iniciado na porta 3001
   - O frontend é servido usando a ferramenta `serve` na porta 3000

## Como Acessar a Aplicação

### Localmente

```bash
# Construir a imagem Docker
docker build -t portal-colaborador-d1 .

# Executar o container mapeando ambas as portas
docker run -p 3000:3000 -p 3001:3001 -e DATABASE_URL=sua_url_db -e JWT_SECRET=seu_segredo portal-colaborador-d1

# Acessar a aplicação no navegador
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api/...
```

### No Render.com

Para o Render.com, você precisará configurar o serviço para expor ambas as portas. Consulte a documentação do Render para mais detalhes sobre como configurar múltiplas portas em um serviço web.

## Vantagens desta Abordagem

1. **Experiência de Desenvolvimento Consistente**: Mantém as mesmas portas usadas durante o desenvolvimento local
2. **Separação Clara**: Frontend e backend mantêm suas portas padrão
3. **Facilidade de Depuração**: Problemas no frontend ou backend podem ser isolados mais facilmente

## Solução de Problemas

Se você encontrar problemas ao acessar os serviços:

1. **Verifique se ambas as portas estão mapeadas corretamente** no comando `docker run`
2. **Confirme que nenhum outro serviço** está usando as portas 3000 ou 3001 em sua máquina
3. **Verifique os logs do container** para identificar possíveis erros de inicialização

## Desenvolvimento Local (fora do Docker)

Para desenvolvimento local fora do Docker, você ainda pode executar o frontend e o backend separadamente:

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

Neste caso, o frontend estará disponível em http://localhost:3000 e o backend em http://localhost:3001.
