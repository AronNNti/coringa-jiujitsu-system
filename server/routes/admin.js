import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getConnection } from '../db.js';

const router = express.Router();

// Middleware de autenticação
router.use(authenticateToken);

// Verificar se é admin
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado' });
    }
    next();
}

// GET /api/admin/stats - Obter estatísticas
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const connection = await getConnection();
        
        const [totalUsuarios] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [totalProfessores] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'professor'");
        const [totalAlunos] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
        
        res.json({
            totalUsuarios: totalUsuarios[0].count,
            totalProfessores: totalProfessores[0].count,
            totalAlunos: totalAlunos[0].count
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter estatísticas' });
    }
});

// GET /api/admin/usuarios - Listar usuários
router.get('/usuarios', isAdmin, async (req, res) => {
    try {
        const connection = await getConnection();
        const [usuarios] = await connection.query('SELECT id, email, name, role FROM users');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar usuários' });
    }
});

// POST /api/admin/usuarios - Criar usuário
router.post('/usuarios', isAdmin, async (req, res) => {
    try {
        const { email, name, password, role } = req.body;
        
        if (!email || !name || !password) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }
        
        const connection = await getConnection();
        
        // Verificar se email já existe
        const [existing] = await connection.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }
        
        // Criptografar senha
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.default.hash(password, 10);
        
        // Inserir usuário
        await connection.query(
            'INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)',
            [email.toLowerCase(), name, hashedPassword, role || 'user']
        );
        
        res.json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

// DELETE /api/admin/usuarios/:id - Deletar usuário
router.delete('/usuarios/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await getConnection();
        
        await connection.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar usuário' });
    }
});

// GET /api/admin/professores - Listar professores
router.get('/professores', isAdmin, async (req, res) => {
    try {
        const connection = await getConnection();
        const [professores] = await connection.query("SELECT id, email, name FROM users WHERE role = 'professor'");
        res.json(professores);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar professores' });
    }
});

// GET /api/admin/alunos - Listar alunos
router.get('/alunos', isAdmin, async (req, res) => {
    try {
        const connection = await getConnection();
        const [alunos] = await connection.query("SELECT id, email, name FROM users WHERE role = 'user'");
        res.json(alunos);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar alunos' });
    }
});

export default router;
