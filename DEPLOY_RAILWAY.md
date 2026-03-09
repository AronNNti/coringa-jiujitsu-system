# Deploy no Railway

Guia passo a passo para fazer deploy do Help Check - Jiu-Jitsu no Railway.

## 📋 Pré-requisitos

1. Conta no [Railway.app](https://railway.app)
2. Conta no [GitHub](https://github.com)
3. Credenciais do TiDB Cloud

## 🚀 Passos para Deploy

### 1. Preparar o Repositório GitHub

```bash
# Inicializar git (se ainda não fez)
git init
git add .
git commit -m "Initial commit: Help Check Jiu-Jitsu"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/helpcheck-jiujitsu.git
git branch -M main
git push -u origin main
```

### 2. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub"
4. Autorize o Railway a acessar seu GitHub
5. Selecione o repositório `helpcheck-jiujitsu`

### 3. Configurar Variáveis de Ambiente

No painel do Railway:

1. Vá para "Variables"
2. Adicione as seguintes variáveis:

```
NODE_ENV=production
PORT=3000

DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=3GWcUNxLYpVsCmk.root
DB_PASSWORD=sua_senha_tidb
DB_NAME=test

JWT_SECRET=sua_chave_jwt_super_secreta_aqui
SESSION_SECRET=sua_chave_session_super_secreta_aqui
```

### 4. Configurar Build Command

No Railway, configure:

- **Build Command**: `npm install --legacy-peer-deps`
- **Start Command**: `node server/index.js`

### 5. Deploy

O Railway fará o deploy automaticamente quando você fazer push para o GitHub.

## 🌐 Configurar Domínio Customizado

1. No Railway, vá para "Settings"
2. Clique em "Domains"
3. Adicione seu domínio customizado
4. Configure os DNS records conforme instruído

## 📊 Monitorar Logs

No painel do Railway, você pode ver os logs em tempo real para debugar qualquer problema.

## 🔧 Troubleshooting

### Erro de conexão com TiDB

- Verifique se as credenciais estão corretas
- Certifique-se de que o IP do Railway está autorizado no TiDB Cloud
- Tente conectar localmente primeiro

### Erro 500 no servidor

- Verifique os logs no Railway
- Certifique-se de que todas as variáveis de ambiente estão configuradas
- Verifique se o banco de dados está acessível

### Frontend não carrega

- Verifique se o servidor está rodando
- Certifique-se de que o proxy está configurado corretamente
- Verifique o console do navegador para erros

## 📝 Próximas Etapas

1. Testar o sistema completo
2. Criar usuários de teste
3. Configurar backup automático do banco de dados
4. Monitorar performance

## 🆘 Suporte

Para dúvidas sobre Railway, consulte a [documentação oficial](https://docs.railway.app).
