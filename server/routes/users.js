import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../db.js';

const router = express.Router();

/**
 * POST /api/users/create-admin
 * Cria novo admin (rota especial)
 */
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    const connection = await pool.getConnection();

    // Verificar se email já existe
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Gerar um openId único para o admin
    const adminOpenId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Inserir admin
    await connection.query(
      'INSERT INTO users (email, password, name, role, openId) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, name, 'admin', adminOpenId]
    );

    connection.release();
    res.json({ message: 'Admin criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({ error: 'Erro ao criar admin' });
  }
});

/**
 * GET /api/users
 * Retorna lista de todos os usuários
 */
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    // Excluir admin da lista de usuários
    const [users] = await connection.query(
      "SELECT id, email, name, role, createdAt FROM users WHERE role != 'admin' ORDER BY createdAt DESC"
    );
    connection.release();
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

/**
 * GET /api/stats
 * Retorna estatísticas de usuários
 */
router.get('/stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Total de usuários
    const [totalResult] = await connection.query('SELECT COUNT(*) as count FROM users');
    const total = totalResult[0]?.count || 0;
    
    // Total de professores
    const [professorsResult] = await connection.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'professor'"
    );
    const professors = professorsResult[0]?.count || 0;
    
    // Total de alunos
    const [studentsResult] = await connection.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'aluno'"
    );
    const students = studentsResult[0]?.count || 0;
    
    connection.release();
    
    res.json({ total, professors, students });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

/**
 * POST /api/users
 * Cria novo usuário
 */
router.post('/', async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    
    // Validar campos obrigatórios
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, nome e senha são obrigatórios' });
    }
    
    // Validar role (deve ser 'professor' ou 'aluno')
    const validRoles = ['professor', 'aluno'];
    const userRole = validRoles.includes(role) ? role : 'aluno';
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const connection = await pool.getConnection();
    
    // Verificar se email já existe
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );
    
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    // Inserir novo usuário com openId único
    const userOpenId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const [result] = await connection.query(
      'INSERT INTO users (email, name, password, role, openId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [email, name, hashedPassword, userRole, userOpenId]
    );
    console.log('Usuário criado:', { email, name, role: userRole, openId: userOpenId });
    
    connection.release();
    
    res.status(201).json({
      id: result.insertId,
      email,
      name,
      role: userRole,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message });
  } finally {
    if (connection) connection.release();
  }
});

/**
 * PUT /api/users/:id
 * Atualiza usuário existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role } = req.body;
    
    // Validar campos obrigatórios
    if (!email || !name) {
      return res.status(400).json({ error: 'Email e nome são obrigatórios' });
    }
    
    // Validar role (deve ser 'professor' ou 'aluno')
    const validRoles = ['professor', 'aluno'];
    const userRole = validRoles.includes(role) ? role : 'aluno';
    
    const connection = await pool.getConnection();
    
    // Verificar se usuário existe
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Verificar se novo email já existe (e não é o mesmo usuário)
    const [emailExists] = await connection.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?',
      [email, id]
    );
    
    if (emailExists.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    // Atualizar usuário
    await connection.query(
      'UPDATE users SET email = ?, name = ?, role = ?, updatedAt = NOW() WHERE id = ?',
      [email, name, userRole, id]
    );
    
    connection.release();
    
    res.json({
      id,
      email,
      name,
      role: userRole,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

/**
 * DELETE /api/users/:id
 * Deleta usuário
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    
    // Verificar se usuário existe
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Deletar usuário
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    
    connection.release();
    
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

export default router;
