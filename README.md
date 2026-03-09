# Help Check - Jiu-Jitsu

Sistema web completo para gerenciar academias de jiu-jitsu com controle de alunos, professores, presença, graduação e mensalidades.

## 🚀 Instalação

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Passos

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar variáveis de ambiente**

Edite o arquivo `.env` com suas credenciais do TiDB Cloud:
```
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
JWT_SECRET=sua_chave_secreta
SESSION_SECRET=sua_chave_de_sessao
```

3. **Iniciar o servidor**
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
helpcheck_jiujitsu/
├── server/
│   ├── index.js              # Servidor Express principal
│   ├── db.js                 # Configuração do banco de dados
│   └── routes/
│       ├── auth.js           # Autenticação
│       ├── alunos.js         # Gestão de alunos
│       ├── aulas.js          # Gestão de aulas e QR Code
│       └── videos.js         # Gestão de vídeos
├── client/
│   ├── index.html            # HTML principal
│   └── src/
│       ├── main.jsx          # Entrada React
│       ├── App.jsx           # Componente principal
│       └── pages/
│           ├── Home.jsx      # Página inicial pública
│           ├── Login.jsx     # Página de login
│           ├── ProfessorDashboard.jsx  # Dashboard do professor
│           └── AlunoDashboard.jsx      # Dashboard do aluno
├── .env                      # Variáveis de ambiente
├── package.json              # Dependências
└── README.md                 # Este arquivo
```

## 🔐 Autenticação

O sistema possui dois tipos de usuários:

### Professor
- Gerenciar alunos
- Criar aulas com QR Code
- Adicionar vídeos técnicos
- Acompanhar presença

### Aluno
- Fazer check-in via QR Code
- Acompanhar presença
- Ver mensalidades
- Visualizar graduação

## 📊 Funcionalidades

### Página Pública
- ✅ Apresentação da academia
- ✅ Biblioteca de vídeos técnicos do YouTube
- ✅ Login para professores e alunos

### Dashboard do Professor
- ✅ Gestão de alunos (criar, editar, deletar)
- ✅ Gestão de aulas com geração de QR Code
- ✅ Adicionar vídeos técnicos
- ✅ Acompanhar presença dos alunos

### Dashboard do Aluno
- ✅ Visualizar graduação atual (com cor da faixa)
- ✅ Fazer check-in via QR Code
- ✅ Acompanhar presença
- ✅ Ver situação de mensalidades
- ✅ Data prevista de próxima graduação

## 🗄️ Banco de Dados

O sistema usa TiDB Cloud (MySQL compatível) com as seguintes tabelas:

- `users` - Usuários (professor e aluno)
- `alunos` - Informações dos alunos
- `aulas` - Aulas criadas
- `presencas` - Registro de presença
- `videos` - Vídeos técnicos

## 🔗 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout
- `GET /api/auth/me` - Verificar autenticação

### Alunos
- `GET /api/alunos` - Listar alunos
- `POST /api/alunos` - Criar aluno
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno

### Aulas
- `GET /api/aulas` - Listar aulas
- `POST /api/aulas` - Criar aula
- `GET /api/aulas/:id/qrcode` - Gerar QR Code
- `POST /api/aulas/:id/checkin` - Fazer check-in

### Vídeos
- `GET /api/videos` - Listar vídeos
- `POST /api/videos` - Adicionar vídeo
- `DELETE /api/videos/:id` - Deletar vídeo

## 🎨 Design

- **Cores principais**: Preto (#0a0a0a) e Ouro (#ffd700)
- **Identidade visual por faixa**:
  - Branca: #f0f0f0
  - Azul: #0066ff
  - Roxa: #9933ff
  - Marrom: #8b4513
  - Preta: #000

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Celular

## 🚀 Deployment

Para fazer deploy em produção:

1. Configure as variáveis de ambiente em produção
2. Use um servidor Node.js (Railway, Heroku, etc.)
3. Configure o banco de dados TiDB Cloud
4. Execute `npm run build` para compilar o frontend
5. Inicie o servidor com `npm run dev`

## 📝 Licença

Este projeto é de uso privado.

## 📞 Suporte

Para dúvidas ou problemas, entre em contato.
