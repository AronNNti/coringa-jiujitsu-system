import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function seedUsers() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🌱 Iniciando seed de usuários...');
    
    // Usuários de teste
    const users = [
      { email: 'admin@coringa.com', password: 'Admin@123', name: 'Administrador', role: 'admin' },
      { email: 'professor@coringa.com', password: 'Prof@123', name: 'Professor Teste', role: 'professor' },
      { email: 'aluno@coringa.com', password: 'Aluno@123', name: 'Aluno Teste', role: 'aluno' },
      { email: 'maria@coringa.com', password: 'Maria@123', name: 'Maria Silva', role: 'aluno' },
      { email: 'joao@coringa.com', password: 'Joao@123', name: 'João Santos', role: 'aluno' },
    ];
    
    for (const user of users) {
      try {
        // Verificar se usuário já existe
        const [existing] = await connection.query(
          'SELECT id FROM users WHERE email = ?',
          [user.email]
        );
        
        if (existing.length > 0) {
          console.log(`⏭️  ${user.email} já existe, pulando...`);
          continue;
        }
        
        // Hash da senha
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Inserir usuário
        const openId = `local-${user.email}-${Date.now()}`;
        await connection.query(
          'INSERT INTO users (email, password, name, role, needsPasswordChange, openId) VALUES (?, ?, ?, ?, ?, ?)',
          [user.email, hashedPassword, user.name, user.role, 0, openId]
        );
        
        console.log(`✅ ${user.email} criado com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao criar ${user.email}:`, error.message);
      }
    }
    
    console.log('✨ Seed concluído!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedUsers();
