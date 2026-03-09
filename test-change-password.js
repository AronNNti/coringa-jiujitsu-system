#!/usr/bin/env node

/**
 * Manual test script for password change functionality
 * Run with: node test-change-password.js
 */

import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n▶ ${name}`, 'blue');
    await fn();
    log(`✓ ${name} passou`, 'green');
    return true;
  } catch (error) {
    log(`✗ ${name} falhou`, 'red');
    log(`  Erro: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`  Response: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

async function runTests() {
  log('\n🧪 Iniciando testes do sistema de mudança de senha...', 'yellow');
  
  let token;
  let userId;
  let passedTests = 0;
  let totalTests = 0;
  let currentPassword = 'AnotherPassword@789'; // Senha atual no banco

  // Teste 1: Login com usuário que não precisa trocar senha
  totalTests++;
  if (await test('Login retorna needsPasswordChange=false para usuário que já trocou', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'joao@test.com',
      password: currentPassword
    });

    if (response.data.user.needsPasswordChange !== false) {
      throw new Error(`needsPasswordChange é ${response.data.user.needsPasswordChange}, esperado false`);
    }

    token = response.data.token;
    userId = response.data.user.id;
  })) {
    passedTests++;
  }

  // Teste 2: Validação de requisitos de senha
  totalTests++;
  if (await test('Rejeita senha com menos de 8 caracteres', async () => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword: 'short'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      throw new Error('Deveria ter rejeitado');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw error;
      }
    }
  })) {
    passedTests++;
  }

  // Teste 3: Rejeita senha sem maiúscula
  totalTests++;
  if (await test('Rejeita senha sem letra maiúscula', async () => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword: 'newpassword@123'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      throw new Error('Deveria ter rejeitado');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw error;
      }
    }
  })) {
    passedTests++;
  }

  // Teste 4: Rejeita senha sem minúscula
  totalTests++;
  if (await test('Rejeita senha sem letra minúscula', async () => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword: 'NEWPASSWORD@123'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      throw new Error('Deveria ter rejeitado');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw error;
      }
    }
  })) {
    passedTests++;
  }

  // Teste 5: Rejeita senha sem número
  totalTests++;
  if (await test('Rejeita senha sem número', async () => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword: 'NewPassword@'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      throw new Error('Deveria ter rejeitado');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw error;
      }
    }
  })) {
    passedTests++;
  }

  // Teste 6: Rejeita senha sem caractere especial
  totalTests++;
  if (await test('Rejeita senha sem caractere especial', async () => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword: 'NewPassword123'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      throw new Error('Deveria ter rejeitado');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw error;
      }
    }
  })) {
    passedTests++;
  }

  // Teste 7: Rejeita senha atual incorreta
  totalTests++;
  if (await test('Rejeita senha atual incorreta', async () => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword: 'WrongPassword@123',
        newPassword: 'NewPassword@456'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      throw new Error('Deveria ter rejeitado');
    } catch (error) {
      if (!error.response || error.response.status !== 401) {
        throw error;
      }
    }
  })) {
    passedTests++;
  }

  // Teste 8: Rejeita requisição sem autenticação
  totalTests++;
  if (await test('Rejeita requisição sem autenticação', async () => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword: 'NewPassword@456'
      });
      throw new Error('Deveria ter rejeitado');
    } catch (error) {
      if (!error.response || error.response.status !== 401) {
        throw error;
      }
    }
  })) {
    passedTests++;
  }

  // Teste 9: Muda senha com sucesso
  totalTests++;
  const newPassword = 'FinalPassword@999';
  if (await test('Muda senha com sucesso', async () => {
    const response = await axios.post(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status !== 200) {
      throw new Error(`Status ${response.status}`);
    }
  })) {
    passedTests++;
  }

  // Teste 10: Login com nova senha funciona
  totalTests++;
  if (await test('Login com nova senha funciona', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'joao@test.com',
      password: newPassword
    });

    if (response.data.user.needsPasswordChange !== false) {
      throw new Error(`needsPasswordChange é ${response.data.user.needsPasswordChange}, esperado false`);
    }
  })) {
    passedTests++;
  }

  // Resumo
  log(`\n${'='.repeat(50)}`, 'yellow');
  log(`📊 Resumo dos testes: ${passedTests}/${totalTests} passaram`, passedTests === totalTests ? 'green' : 'red');
  log(`${'='.repeat(50)}\n`, 'yellow');

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTests().catch(error => {
  log(`\n❌ Erro fatal: ${error.message}`, 'red');
  process.exit(1);
});
