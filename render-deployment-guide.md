# Guia de Deploy no Render.com - Portal Colaborador D1

Este guia detalha como configurar e publicar o Portal Colaborador D1 na plataforma Render.com, considerando a configuração de múltiplas portas (frontend na porta 3000 e backend na porta 3001) em um único container Docker.

## Configuração do Serviço Web no Render.com

### 1. Criar um Novo Serviço Web

1. Acesse o dashboard do Render.com e faça login
2. Clique em "New +" e selecione "Web Service"
3. Conecte sua conta GitHub e selecione o repositório `portal-colaborador-D1`

### 2. Configurar o Serviço

Configure o serviço com as seguintes opções:

- **Nome**: `portal-colaborador-d1` (ou outro nome de sua preferência)
- **Região**: Escolha a região mais próxima dos seus usuários
- **Branch**: `main` (ou a branch que deseja publicar)
- **Runtime**: Docker
- **Dockerfile Path**: `./Dockerfile` (caminho relativo ao Dockerfile na raiz)
- **Port**: `3000` (esta será a porta principal exposta pelo Render)
- **Plan**: Escolha o plano adequado (Free é suficiente para testes)

### 3. Configurar Port Forwarding para o Backend

Para que o backend na porta 3001 também seja acessível:

1. Expanda a seção "Advanced"
2. Encontre "Internal Port Forwarding"
3. Adicione um mapeamento:
   - **Source Port**: `3001`
   - **Destination Port**: `3001`
   - **Protocol**: `HTTP`

### 4. Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

- `NODE_ENV`: `production`
- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `JWT_SECRET`: Chave secreta para geração de tokens JWT
- Outras variáveis específicas do seu projeto conforme necessário

### 5. Finalizar a Criação do Serviço

Clique em "Create Web Service" para iniciar o processo de build e deploy.

## Como Funciona o Deploy

1. O Render detecta o Dockerfile e inicia o processo de build
2. O script `start-services.sh` é executado como comando de inicialização
3. O script inicia o frontend na porta 3000 e o backend na porta 3001
4. O Render expõe a porta 3000 como porta principal
5. O mapeamento interno de portas permite acesso à porta 3001

## Acessando a Aplicação

Após o deploy, o Render fornecerá uma URL para acessar seu serviço (por exemplo, `https://portal-colaborador-d1.onrender.com`).

- **Frontend**: Acessível diretamente pela URL principal (ex: `https://portal-colaborador-d1.onrender.com`)
- **Backend API**: Acessível através da mesma URL base, com as rotas API (ex: `https://portal-colaborador-d1.onrender.com/api/...`)

## Monitoramento e Manutenção

### Logs e Monitoramento

Para monitorar seu serviço:

1. Acesse o dashboard do serviço no Render
2. Clique na aba "Logs" para visualizar os logs em tempo real
3. Os logs mostrarão a saída de ambos os serviços (frontend e backend)

### Atualizações

Para atualizar sua aplicação:

1. Faça push das alterações para o repositório GitHub
2. O Render detectará automaticamente as mudanças e iniciará um novo deploy
3. Alternativamente, você pode acionar um deploy manual clicando em "Manual Deploy" > "Deploy latest commit"

## Solução de Problemas

### Verificando Status dos Serviços

Se encontrar problemas, verifique os logs para confirmar que ambos os serviços estão rodando:

```
Iniciando backend na porta 3001...
Iniciando frontend na porta 3000...
Serviços iniciados. Pressione Ctrl+C para encerrar.
```

### Problemas com Port Forwarding

Se o backend não estiver acessível:

1. Verifique se o mapeamento de portas foi configurado corretamente
2. Confirme nos logs que o backend está rodando na porta 3001
3. Teste acessar uma rota de API específica para verificar se o backend está respondendo

### Problemas com Banco de Dados

Se houver erros de conexão com o banco de dados:

1. Verifique se a variável `DATABASE_URL` está configurada corretamente
2. Confirme que o banco de dados está acessível a partir do Render
3. Verifique se as credenciais do banco de dados estão corretas

---

Este guia fornece as instruções para publicar o Portal Colaborador D1 no Render.com utilizando Docker com múltiplas portas. Ajustes específicos podem ser necessários dependendo das particularidades do seu projeto.
