import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// API de demonstração (sem banco de dados)
app.get('/api/videos', (req, res) => {
  res.json([
    {
      id: 1,
      titulo: 'Técnica de Guarda Fechada',
      url_youtube: 'https://www.youtube.com/watch?v=example1',
      descricao: 'Aprenda as técnicas fundamentais da guarda fechada',
      professor: 'Prof. João'
    },
    {
      id: 2,
      titulo: 'Escape da Montada',
      url_youtube: 'https://www.youtube.com/watch?v=example2',
      descricao: 'Técnicas eficazes para escapar da posição de montada',
      professor: 'Prof. Maria'
    },
    {
      id: 3,
      titulo: 'Passagem de Guarda',
      url_youtube: 'https://www.youtube.com/watch?v=example3',
      descricao: 'Métodos avançados para passar a guarda do oponente',
      professor: 'Prof. Carlos'
    }
  ]);
});

app.get('/api/auth/me', (req, res) => {
  res.status(401).json({ error: 'Não autenticado' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login em desenvolvimento' });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout realizado' });
});

// Servir a aplicação React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`🎨 Acesse http://localhost:${PORT} para ver o design`);
  console.log(`📝 Nota: Este é um servidor de demonstração sem banco de dados`);
});
