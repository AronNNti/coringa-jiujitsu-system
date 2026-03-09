import express from 'express';
import QRCode from 'qrcode';
import pool from '../db.js';

const router = express.Router();

// Listar aulas
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [aulas] = await connection.query(`
      SELECT a.id, a.titulo, a.data_hora, u.name as professor
      FROM aulas a
      JOIN users u ON a.professor_id = u.id
      ORDER BY a.data_hora DESC
    `);
    connection.release();
    res.json(aulas);
  } catch (error) {
    console.error('Erro ao listar aulas:', error);
    res.status(500).json({ error: 'Erro ao listar aulas' });
  }
});

// Criar aula
router.post('/', async (req, res) => {
  try {
    const { professor_id, data_hora, titulo } = req.body;

    if (!professor_id || !data_hora) {
      return res.status(400).json({ error: 'Professor e data/hora obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO aulas (professor_id, data_hora, titulo) VALUES (?, ?, ?)',
      [professor_id, data_hora, titulo || 'Aula']
    );

    connection.release();

    // Gerar QR Code
    const qrData = `${process.env.BASE_URL || 'http://localhost:3000'}/checkin/${result.insertId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    res.json({
      message: 'Aula criada com sucesso',
      id: result.insertId,
      qrCode
    });
  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(500).json({ error: 'Erro ao criar aula' });
  }
});

// Gerar QR Code para aula
router.get('/:id/qrcode', async (req, res) => {
  try {
    const { id } = req.params;
    const qrData = `${process.env.BASE_URL || 'http://localhost:3000'}/checkin/${id}`;
    const qrCode = await QRCode.toDataURL(qrData);
    res.json({ qrCode });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).json({ error: 'Erro ao gerar QR Code' });
  }
});

// Check-in via QR Code
router.post('/:id/checkin', async (req, res) => {
  try {
    const { id } = req.params;
    const { aluno_id } = req.body;

    if (!aluno_id) {
      return res.status(400).json({ error: 'Aluno ID obrigatório' });
    }

    const connection = await pool.getConnection();

    // Verificar se já fez check-in
    const [existing] = await connection.query(
      'SELECT id FROM presencas WHERE aluno_id = ? AND aula_id = ? AND DATE(data_checkin) = CURDATE()',
      [aluno_id, id]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Você já fez check-in nesta aula' });
    }

    // Registrar presença
    await connection.query(
      'INSERT INTO presencas (aluno_id, aula_id) VALUES (?, ?)',
      [aluno_id, id]
    );

    connection.release();
    res.json({ message: 'Check-in realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao fazer check-in:', error);
    res.status(500).json({ error: 'Erro ao fazer check-in' });
  }
});

export default router;
