import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente ANTES de qualquer coisa
dotenv.config();

// Log DETALHADO das variáveis de ambiente para debug
console.log('[Database] === VARIÁVEIS DE AMBIENTE ===');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DB_HOST:', process.env.DB_HOST || '❌ NÃO DEFINIDA');
console.log('  DB_PORT:', process.env.DB_PORT || '❌ NÃO DEFINIDA');
console.log('  DB_USER:', process.env.DB_USER || '❌ NÃO DEFINIDA');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ DEFINIDA' : '❌ NÃO DEFINIDA');
console.log('  DB_NAME:', process.env.DB_NAME || '❌ NÃO DEFINIDA');
console.log('[Database] === FIM VARIÁVEIS ===')

// Usar APENAS as variáveis de ambiente, sem fallback
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Validar que todas as variáveis estão definidas
if (!dbConfig.host || !dbConfig.port || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  console.error('❌ ERRO: Variáveis de ambiente não estão configuradas!');
  console.error('Variáveis obrigatórias:', dbConfig);
  process.exit(1);
}

console.log(`[Database] Conectando a: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  },
  enableKeepAlive: true,
});



export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado ao TiDB Cloud');
    
    // Atualizar schema da tabela users
    try {
      await connection.query('ALTER TABLE users MODIFY COLUMN role ENUM("admin", "professor", "aluno") NOT NULL');
      await connection.query('ALTER TABLE users ADD COLUMN openId VARCHAR(255) DEFAULT NULL');
    } catch (e) {
      // Tabela pode não existir ainda ou coluna já existe, ignorar erro
    }
    
    // Criar tabelas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'professor', 'aluno') NOT NULL,
        pin VARCHAR(10),
        openId VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS alunos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        faixa VARCHAR(50) DEFAULT 'branca',
        mensalidade_status ENUM('paga', 'pendente') DEFAULT 'pendente',
        data_graduacao_prevista DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS aulas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        professor_id INT NOT NULL,
        data_hora DATETIME NOT NULL,
        titulo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS presencas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aluno_id INT NOT NULL,
        aula_id INT NOT NULL,
        data_checkin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
        FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        professor_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        url_youtube VARCHAR(255) NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('✅ Tabelas criadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

export default pool;
