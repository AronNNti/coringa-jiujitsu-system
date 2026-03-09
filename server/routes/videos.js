import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Listar vídeos
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [videos] = await connection.query(`
      SELECT v.id, v.titulo, v.url_youtube, v.descricao, u.name as professor
      FROM videos v
      JOIN users u ON v.professor_id = u.id
      ORDER BY v.created_at DESC
    `);
    connection.release();
    res.json(videos);
  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    res.status(500).json({ error: 'Erro ao listar vídeos' });
  }
});

// Criar vídeo (professor)
router.post('/', async (req, res) => {
  try {
    const { professor_id, titulo, url_youtube, descricao } = req.body;

    if (!professor_id || !titulo || !url_youtube) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO videos (professor_id, titulo, url_youtube, descricao) VALUES (?, ?, ?, ?)',
      [professor_id, titulo, url_youtube, descricao || '']
    );
    connection.release();

    res.json({ message: 'Vídeo adicionado com sucesso', id: result.insertId });
  } catch (error) {
    console.error('Erro ao criar vídeo:', error);
    res.status(500).json({ error: 'Erro ao criar vídeo' });
  }
});

// Deletar vídeo (professor)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM videos WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Vídeo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    res.status(500).json({ error: 'Erro ao deletar vídeo' });
  }
});

export default router;
