import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');

// Criar diretório de uploads se não existir
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * POST /api/avatar/upload
 * Upload de foto de perfil do aluno
 */
router.post('/upload', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { belt } = req.body;

    if (!belt) {
      return res.status(400).json({ message: 'Faixa obrigatória' });
    }

    // Validar faixa
    const validBelts = ['white', 'gray', 'yellow', 'orange', 'red', 'blue', 'purple', 'brown', 'black', 'coral'];
    if (!validBelts.includes(belt)) {
      return res.status(400).json({ message: 'Faixa inválida' });
    }

    // Verificar se arquivo foi enviado
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ message: 'Foto obrigatória' });
    }

    const photo = req.files.photo;
    const fileName = `avatar-${decoded.id}-${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, fileName);

    // Salvar arquivo
    await photo.mv(filePath);

    // Atualizar banco de dados
    const connection = await pool.getConnection();
    
    try {
      // Verificar se usuário existe
      const [users] = await connection.query('SELECT id FROM users WHERE id = ?', [decoded.id]);
      
      if (!users || users.length === 0) {
        connection.release();
        fs.unlinkSync(filePath); // Deletar arquivo se usuário não existe
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Atualizar avatar e faixa do usuário
      await connection.query(
        'UPDATE users SET avatar = ?, belt = ? WHERE id = ?',
        [fileName, belt, decoded.id]
      );

      connection.release();

      res.json({
        message: 'Avatar salvo com sucesso',
        avatar: fileName,
        belt: belt
      });
    } catch (error) {
      connection.release();
      fs.unlinkSync(filePath); // Deletar arquivo em caso de erro
      throw error;
    }
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do avatar' });
  }
});

/**
 * GET /api/avatar/:userId
 * Retorna avatar do usuário
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT avatar, belt FROM users WHERE id = ?', [userId]);
    connection.release();

    if (!users || users.length === 0 || !users[0].avatar) {
      return res.status(404).json({ message: 'Avatar não encontrado' });
    }

    const filePath = path.join(uploadsDir, users[0].avatar);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Erro ao buscar avatar:', error);
    res.status(500).json({ message: 'Erro ao buscar avatar' });
  }
});

export default router;


// Salvar avatar customizado
router.post('/save', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Nao autenticado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { belt, photo } = req.body;

    if (!belt) {
      return res.status(400).json({ message: 'Faixa obrigatoria' });
    }

    const validBelts = [
      'branca', 'branca-infantil', 'cinza', 'cinza-infantil',
      'amarela', 'amarela-infantil', 'laranja', 'laranja-infantil',
      'verde', 'verde-infantil', 'azul', 'roxa', 'marrom', 'preta', 'coral'
    ];

    if (!validBelts.includes(belt)) {
      return res.status(400).json({ message: 'Faixa invalida' });
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'UPDATE users SET belt = ? WHERE id = ?',
        [belt, decoded.id]
      );

      if (photo) {
        await connection.query(
          'UPDATE users SET avatar = ? WHERE id = ?',
          [photo, decoded.id]
        );
      }

      connection.release();

      res.json({
        message: 'Avatar salvo com sucesso',
        belt: belt
      });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar avatar:', error);
    res.status(500).json({ message: 'Erro ao salvar avatar' });
  }
});
