import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    if (role !== 'professor' && role !== 'aluno') {
      return res.status(400).json({ error: 'Role inválido' });
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

    // Inserir usuário
    await connection.query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    connection.release();
    res.json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha obrigatórios' });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    // Verificar se é o primeiro acesso (senha padrão ou precisa trocar)
    const needsPasswordChange = user.needsPasswordChange ? true : false;
    
    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        needsPasswordChange: needsPasswordChange
      },
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout realizado com sucesso' });
});

// Verificar autenticação
router.get('/me', (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Alterar senha
router.post('/change-password', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha obrigatórias' });
    }

    // Validar requisitos de senha
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Senha deve ter mínimo 8 caracteres' });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Senha deve conter letra maiúscula' });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Senha deve conter letra minúscula' });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'Senha deve conter número' });
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({ message: 'Senha deve conter caractere especial (!@#$%^&*)' });
    }

    // Buscar usuário
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!users || users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = users[0];

    // Verificar senha atual
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e marcar como não precisando mais trocar
    await connection.query('UPDATE users SET password = ?, needsPasswordChange = 0 WHERE id = ?', [
      hashedPassword,
      decoded.id
    ]);
    
    connection.release();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

export default router;
