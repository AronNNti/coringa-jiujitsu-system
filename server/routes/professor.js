import express from 'express';
import pool from '../db.js';

const router = express.Router();

/**
 * GET /api/professor/students
 * Retorna lista de alunos do professor
 */
router.get('/students', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [students] = await connection.query(
      `SELECT id, name, email, belt, createdAt FROM users 
       WHERE role = 'aluno' 
       ORDER BY name ASC`
    );
    
    connection.release();
    
    res.json(students);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

/**
 * GET /api/professor/classes
 * Retorna lista de aulas do professor
 */
router.get('/classes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [classes] = await connection.query(
      `SELECT id, name, time, location, level, createdAt FROM classes 
       ORDER BY time ASC`
    );
    
    connection.release();
    
    res.json(classes);
  } catch (error) {
    console.error('Erro ao buscar aulas:', error);
    res.status(500).json({ error: 'Erro ao buscar aulas' });
  }
});

/**
 * POST /api/professor/students
 * Cria novo aluno
 */
router.post('/students', async (req, res) => {
  try {
    const { name, email, belt } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    
    const connection = await pool.getConnection();
    
    // Verificar se email já existe
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );
    
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    // Inserir novo aluno
    const [result] = await connection.query(
      'INSERT INTO users (name, email, belt, role, openId, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, belt || 'branca', 'aluno', `aluno-${Date.now()}`]
    );
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      belt: belt || 'branca',
      message: 'Aluno criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

/**
 * PUT /api/professor/students/:id
 * Atualiza aluno
 */
router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, belt } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    
    const connection = await pool.getConnection();
    
    // Atualizar aluno
    await connection.query(
      'UPDATE users SET name = ?, email = ?, belt = ? WHERE id = ?',
      [name, email, belt || 'branca', id]
    );
    
    connection.release();
    
    res.json({
      id,
      name,
      email,
      belt: belt || 'branca',
      message: 'Aluno atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

/**
 * DELETE /api/professor/students/:id
 * Deleta aluno
 */
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM users WHERE id = ? AND role = "aluno"', [id]);
    
    connection.release();
    
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: 'Erro ao deletar aluno' });
  }
});

/**
 * POST /api/professor/classes
 * Cria nova aula
 */
router.post('/classes', async (req, res) => {
  try {
    const { name, time, location, level } = req.body;
    
    if (!name || !time || !location || !level) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO classes (name, time, location, level, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [name, time, location, level]
    );
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      name,
      time,
      location,
      level,
      message: 'Aula criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(500).json({ error: 'Erro ao criar aula' });
  }
});

/**
 * PUT /api/professor/classes/:id
 * Atualiza aula
 */
router.put('/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, time, location, level } = req.body;
    
    if (!name || !time || !location || !level) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE classes SET name = ?, time = ?, location = ?, level = ? WHERE id = ?',
      [name, time, location, level, id]
    );
    
    connection.release();
    
    res.json({
      id,
      name,
      time,
      location,
      level,
      message: 'Aula atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar aula:', error);
    res.status(500).json({ error: 'Erro ao atualizar aula' });
  }
});

/**
 * DELETE /api/professor/classes/:id
 * Deleta aula
 */
router.delete('/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    
    await connection.query('DELETE FROM classes WHERE id = ?', [id]);
    
    connection.release();
    
    res.json({ message: 'Aula deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aula:', error);
    res.status(500).json({ error: 'Erro ao deletar aula' });
  }
});

export default router;
