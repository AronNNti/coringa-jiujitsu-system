# Coringa Jiu-Jitsu - Funcionalidades Principais

## OBJETIVO: Plataforma 100% Funcional para Professor e Aluno

---

## PROFESSOR - O que ele precisa fazer

### 1. Gestão de Alunos
- [x] Adicionar novo aluno
- [x] Editar dados do aluno (nome, email, faixa)
- [x] Deletar aluno
- [x] Visualizar lista de alunos
- [x] Filtrar alunos por nome, faixa
- [ ] **Visualizar histórico de presença de cada aluno**
- [ ] **Visualizar status de mensalidade de cada aluno**
- [ ] **Exportar lista de alunos em Excel**

### 2. Gestão de Aulas
- [x] Criar nova aula (nome, horário, local, nível)
- [x] Editar aula
- [x] Deletar aula
- [x] Visualizar lista de aulas
- [ ] **Agendar aulas recorrentes (seg, qua, sex)**
- [ ] **Visualizar quantos alunos estão inscritos**
- [ ] **Gerar QR code para aula (botão fácil)**

### 3. Controle de Presença
- [x] Gerar QR code para aula
- [ ] **Ver presença em tempo real durante a aula**
- [ ] **Registrar presença manualmente (se aluno não conseguir ler QR)**
- [ ] **Relatório de presença por aluno (quantas aulas foi)**
- [ ] **Relatório de presença por aula (quem foi e quem faltou)**
- [ ] **Exportar relatório em Excel/PDF**

### 4. Controle de Mensalidade
- [ ] **Visualizar status de mensalidade de cada aluno (Pago/Pendente/Vencido)**
- [ ] **Registrar pagamento de mensalidade**
- [ ] **Marcar como vencido**
- [ ] **Gerar relatório de mensalidade**
- [ ] **Enviar notificação de vencimento**

### 5. Controle de Graduação
- [ ] **Visualizar faixa atual de cada aluno**
- [ ] **Registrar promoção de faixa**
- [ ] **Histórico de graduações**
- [ ] **Gerar certificado de promoção**

---

## ALUNO - O que ele precisa fazer

### 1. Login e Autenticação
- [x] Login com email e senha
- [x] Logout
- [x] Mudança de senha obrigatória no primeiro acesso
- [ ] **Recuperação de senha (esqueci a senha)**

### 2. Perfil e Avatar
- [x] Visualizar perfil
- [x] Personalizar avatar com kimoninho
- [x] Selecionar faixa
- [x] Upload de foto
- [ ] **Editar dados pessoais (telefone, endereço, data de nascimento)**

### 3. Check-in (QR Code) - CRÍTICO
- [x] Escanear QR code da aula
- [x] Confirmar presença
- [ ] **Feedback visual de sucesso (✓ Presença confirmada)**
- [ ] **Histórico de check-ins**
- [ ] **Notificação de presença confirmada**

### 4. Presença
- [x] Visualizar histórico de presença
- [x] Ver taxa de presença (%)
- [ ] **Filtrar por mês/período**
- [ ] **Exportar histórico de presença**
- [ ] **Notificação se faltou muito**

### 5. Mensalidade - CRÍTICO
- [x] Visualizar status de mensalidade (Pago/Pendente/Vencido)
- [x] Ver valor da mensalidade
- [x] Ver data de vencimento
- [ ] **Gerar boleto para pagamento**
- [ ] **Histórico de pagamentos**
- [ ] **Notificação de vencimento**

### 6. Graduação
- [x] Visualizar faixa atual
- [ ] **Ver requisitos para próxima faixa**
- [ ] **Visualizar histórico de graduações**
- [ ] **Certificados de promoção**

---

## PRIORIDADES - O que é CRÍTICO

### MÁXIMA PRIORIDADE (Deve funcionar 100%)
1. **QR Code Check-in** - Aluno escaneia e confirma presença
2. **Presença** - Aluno vê histórico e taxa de presença
3. **Mensalidade** - Aluno vê status (Pago/Pendente/Vencido)
4. **Gestão de Alunos** - Professor adiciona, edita, deleta
5. **Gestão de Aulas** - Professor cria e gera QR code

### ALTA PRIORIDADE (Importante)
1. Relatórios de presença
2. Controle de mensalidade do professor
3. Edição inline de dados
4. Filtros avançados
5. Responsividade mobile

### MÉDIA PRIORIDADE (Pode ser depois)
1. Certificados
2. Integração de pagamento
3. Notificações por email
4. Gráficos avançados
5. Modo offline

---

## TESTES NECESSÁRIOS

### Teste 1: Login e Autenticação
- [ ] Login com email correto funciona
- [ ] Login com email incorreto falha
- [ ] Logout funciona
- [ ] Redirecionamento correto por role

### Teste 2: QR Code Check-in
- [ ] Professor gera QR code
- [ ] Aluno escaneia QR code
- [ ] Presença registrada no banco
- [ ] Feedback visual de sucesso
- [ ] Histórico atualizado

### Teste 3: Presença
- [ ] Histórico carrega com dados reais
- [ ] Taxa de presença calculada corretamente
- [ ] Filtros funcionam
- [ ] Dados são precisos

### Teste 4: Mensalidade
- [ ] Status exibido corretamente
- [ ] Cores corretas (Pago=verde, Pendente=amarelo, Vencido=vermelho)
- [ ] Valores corretos
- [ ] Datas corretas

### Teste 5: Gestão de Alunos (Professor)
- [ ] Adicionar aluno funciona
- [ ] Editar aluno funciona
- [ ] Deletar aluno funciona
- [ ] Filtros funcionam
- [ ] Dados salvos no banco

### Teste 6: Gestão de Aulas (Professor)
- [ ] Criar aula funciona
- [ ] Editar aula funciona
- [ ] Deletar aula funciona
- [ ] QR code gerado
- [ ] Dados salvos no banco

### Teste 7: Responsividade
- [ ] Desktop (1920x1080) - OK
- [ ] Tablet (768x1024) - OK
- [ ] Mobile (375x667) - OK
- [ ] iPhone X (375x812) - OK

### Teste 8: Navegadores
- [ ] Chrome - OK
- [ ] Firefox - OK
- [ ] Safari - OK
- [ ] Edge - OK

---

## Status Atual

**Implementado**: 60%
**Em Desenvolvimento**: 30%
**Pendente**: 10%

### O que já funciona:
- ✅ Login e autenticação
- ✅ Mudança de senha
- ✅ Avatar personalizado
- ✅ Dashboard aluno (básico)
- ✅ Dashboard professor (básico)
- ✅ Dashboard admin
- ✅ Gestão de alunos (CRUD)
- ✅ Gestão de aulas (CRUD)
- ✅ QR code (geração básica)
- ✅ Responsividade mobile

### O que precisa ser melhorado:
- ⏳ QR code check-in (validação completa)
- ⏳ Presença (integração completa)
- ⏳ Mensalidade (sistema completo)
- ⏳ Relatórios (professor)
- ⏳ Notificações
- ⏳ Testes em produção

---

## Próximos Passos

1. **Testar QR code em produção** (Railway)
2. **Validar presença** (dados reais)
3. **Validar mensalidade** (dados reais)
4. **Testar em celular** (iPhone + Android)
5. **Corrigir bugs** encontrados
6. **Otimizar performance**
7. **Deploy final**

---

**Objetivo Final**: Um site que o professor usa para gerenciar alunos e aulas, e o aluno usa para fazer check-in com QR code, ver presença e mensalidade. Simples, rápido e funcional!
