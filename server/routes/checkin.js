import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

// Armazenar tokens de check-in em memória (em produção, usar banco de dados)
const activeCheckIns = new Map();

/**
 * POST /api/checkin/create
 * Cria um novo token de check-in para uma aula
 */
router.post('/create', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { token: checkInToken, className, classTime } = req.body;

    if (!checkInToken || !className || !classTime) {
      return res.status(400).json({ message: 'Dados obrigatórios faltando' });
    }

    // Verificar se é professor
    if (decoded.role !== 'professor') {
      return res.status(403).json({ message: 'Apenas professores podem criar check-in' });
    }

    // Salvar token de check-in com expiração de 30 minutos
    const expirationTime = Date.now() + (30 * 60 * 1000);
    activeCheckIns.set(checkInToken, {
      professorId: decoded.id,
      className: className,
      classTime: classTime,
      createdAt: new Date(),
      expiresAt: expirationTime,
      students: []
    });

    // Limpar tokens expirados
    for (const [key, value] of activeCheckIns.entries()) {
      if (value.expiresAt < Date.now()) {
        activeCheckIns.delete(key);
      }
    }

    res.json({
      message: 'Check-in criado com sucesso',
      token: checkInToken
    });
  } catch (error) {
    console.error('Erro ao criar check-in:', error);
    res.status(500).json({ message: 'Erro ao criar check-in' });
  }
});

/**
 * POST /api/checkin/scan
 * Registra o check-in de um aluno
 */
router.post('/scan', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { token: checkInToken, studentId } = req.body;

    if (!checkInToken || !studentId) {
      return res.status(400).json({ message: 'Dados obrigatórios faltando' });
    }

    // Verificar se token de check-in existe e não expirou
    const checkIn = activeCheckIns.get(checkInToken);
    if (!checkIn) {
      return res.status(404).json({ message: 'QR code inválido ou expirado' });
    }

    if (checkIn.expiresAt < Date.now()) {
      activeCheckIns.delete(checkInToken);
      return res.status(400).json({ message: 'QR code expirado' });
    }

    // Verificar se aluno já fez check-in
    if (checkIn.students.includes(studentId)) {
      return res.status(400).json({ message: 'Você já fez check-in desta aula' });
    }

    // Registrar check-in no banco de dados
    const connection = await pool.getConnection();

    try {
      // Criar tabela de check-ins se não existir
      await connection.query(`
        CREATE TABLE IF NOT EXISTS checkins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          studentId INT NOT NULL,
          professorId INT NOT NULL,
          className VARCHAR(255) NOT NULL,
          classTime VARCHAR(10) NOT NULL,
          checkinTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Inserir check-in
      await connection.query(
        'INSERT INTO checkins (studentId, professorId, className, classTime) VALUES (?, ?, ?, ?)',
        [studentId, checkIn.professorId, checkIn.className, checkIn.classTime]
      );

      // Adicionar aluno à lista de check-in em memória
      checkIn.students.push(studentId);

      connection.release();

      res.json({
        message: 'Check-in realizado com sucesso',
        className: checkIn.className,
        classTime: checkIn.classTime
      });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao fazer check-in:', error);
    res.status(500).json({ message: 'Erro ao fazer check-in' });
  }
});

/**
 * GET /api/checkin/history/:studentId
 * Retorna histórico de check-ins do aluno
 */
router.get('/history/:studentId', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { studentId } = req.params;

    // Verificar permissão
    if (decoded.id !== parseInt(studentId) && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    const connection = await pool.getConnection();

    try {
      const [checkins] = await connection.query(
        'SELECT * FROM checkins WHERE studentId = ? ORDER BY checkinTime DESC LIMIT 50',
        [studentId]
      );

      connection.release();

      res.json(checkins);
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao buscar histórico de check-in:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico de check-in' });
  }
});

/**
 * GET /api/checkin/class-stats/:professorId
 * Retorna estatísticas de check-in de uma aula
 */
router.get('/class-stats/:professorId', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { professorId } = req.params;

    // Verificar permissão
    if (decoded.id !== parseInt(professorId) && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Sem permissão' });
    }

    const connection = await pool.getConnection();

    try {
      // Total de check-ins por aula
      const [stats] = await connection.query(
        'SELECT className, classTime, COUNT(*) as totalCheckins, COUNT(DISTINCT DATE(checkinTime)) as daysWithCheckins FROM checkins WHERE professorId = ? GROUP BY className, classTime ORDER BY classTime DESC',
        [professorId]
      );

      connection.release();

      res.json(stats);
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas de check-in:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas de check-in' });
  }
});

export default router;
