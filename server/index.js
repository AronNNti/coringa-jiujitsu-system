import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';
import pool from './db.js';
import fileUpload from 'express-fileupload';
import authRoutes from './routes/auth.js';
import avatarRoutes from './routes/avatar.js';
import checkInRoutes from './routes/checkin.js';
import alunoRoutes from './routes/alunos.js';
import aulaRoutes from './routes/aulas.js';
import videoRoutes from './routes/videos.js';
import userRoutes from './routes/users.js';
import professorRoutes from './routes/professor.js';
import excelRoutes from './routes/excel.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

// Servir arquivos estáticos
app.use(express.static('public'));
app.use(express.static('client'));

// Inicializar banco de dados
await initializeDatabase();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/checkin', checkInRoutes);
app.use('/api/users', userRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/aulas', aulaRoutes);
app.use('/api/videos', videoRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Help Check - Jiu-Jitsu API' });
});

// Rota de estatísticas
app.get('/api/stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [totalResult] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role != "admin"');
    const total = totalResult[0]?.count || 0;
    const [professorsResult] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = "professor"');
    const professors = professorsResult[0]?.count || 0;
    const [studentsResult] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = "aluno"');
    const students = studentsResult[0]?.count || 0;
    connection.release();
    res.json({ total, professors, students });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Servir React app
app.get('/', (req, res) => {
  res.sendFile(new URL('../client/index.html', import.meta.url).pathname);
});

app.get('*', (req, res) => {
  res.sendFile(new URL('../client/index.html', import.meta.url).pathname);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
