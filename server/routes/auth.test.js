import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import pool from '../db.js';

describe('Authentication Routes', () => {
  let testUserId;
  let testToken;
  let connection;

  beforeAll(async () => {
    // Criar um usuário de teste
    connection = await pool.getConnection();
    
    // Limpar usuário de teste se existir
    try {
      await connection.query('DELETE FROM users WHERE email = ?', ['test.change.password@test.com']);
    } catch (e) {
      // Ignorar erro se tabela não existe
    }

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('OldPassword@123', 10);
    await connection.query(
      'INSERT INTO users (email, password, name, role, needsPasswordChange) VALUES (?, ?, ?, ?, ?)',
      ['test.change.password@test.com', hashedPassword, 'Test User', 'aluno', 1]
    );

    connection.release();
  });

  afterAll(async () => {
    // Limpar usuário de teste
    const connection = await pool.getConnection();
    try {
      await connection.query('DELETE FROM users WHERE email = ?', ['test.change.password@test.com']);
    } catch (e) {
      // Ignorar erro
    }
    connection.release();
  });

  describe('POST /api/auth/login', () => {
    it('should return needsPasswordChange flag for new users', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.change.password@test.com',
          password: 'OldPassword@123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.needsPasswordChange).toBe(1);
      expect(response.body.token).toBeDefined();

      testToken = response.body.token;
      testUserId = response.body.user.id;
    });

    it('should return needsPasswordChange as false for users who changed password', async () => {
      // Primeiro, fazer login e mudar senha
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.change.password@test.com',
          password: 'OldPassword@123'
        });

      const token = loginResponse.body.token;

      // Mudar senha
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@456'
        });

      // Fazer login novamente com a nova senha
      const secondLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.change.password@test.com',
          password: 'NewPassword@456'
        });

      expect(secondLoginResponse.status).toBe(200);
      expect(secondLoginResponse.body.user.needsPasswordChange).toBe(0);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should reject invalid password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'short'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('mínimo 8 caracteres');
    });

    it('should reject password without uppercase', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'newpassword@123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('letra maiúscula');
    });

    it('should reject password without lowercase', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'NEWPASSWORD@123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('letra minúscula');
    });

    it('should reject password without number', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('número');
    });

    it('should reject password without special character', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('caractere especial');
    });

    it('should reject incorrect current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'WrongPassword@123',
          newPassword: 'NewPassword@456'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Senha atual incorreta');
    });

    it('should successfully change password with valid requirements', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@456'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Senha alterada com sucesso');
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'OldPassword@123',
          newPassword: 'NewPassword@456'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Não autenticado');
    });
  });
});
