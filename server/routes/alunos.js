import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Listar alunos (professor)
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [alunos] = await connection.query(`
      SELECT a.id, u.name, u.email, a.faixa, a.mensalidade_status, a.data_graduacao_prevista
      FROM alunos a
      JOIN users u ON a.user_id = u.id
      ORDER BY u.name
    `);
    connection.release();
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro ao listar alunos' });
  }
});

// Criar aluno
router.post('/', async (req, res) => {
  try {
    const { name, email, faixa } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email obrigatórios' });
    }

    const connection = await pool.getConnection();

    // Criar usuário
    const [result] = await connection.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, 'temp_password', name, 'aluno']
    );

    // Criar aluno
    await connection.query(
      'INSERT INTO alunos (user_id, faixa) VALUES (?, ?)',
      [result.insertId, faixa || 'branca']
    );

    connection.release();
    res.json({ message: 'Aluno criado com sucesso', id: result.insertId });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// Atualizar aluno
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, faixa, mensalidade_status } = req.body;

    const connection = await pool.getConnection();

    if (name) {
      await connection.query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
    }

    if (faixa || mensalidade_status) {
      await connection.query(
        'UPDATE alunos SET faixa = ?, mensalidade_status = ? WHERE user_id = ?',
        [faixa, mensalidade_status, id]
      );
    }

    connection.release();
    res.json({ message: 'Aluno atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

// Deletar aluno
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    connection.release();

    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: 'Erro ao deletar aluno' });
  }
});

export default router;
