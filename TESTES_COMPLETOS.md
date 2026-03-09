# Coringa Jiu-Jitsu - Plano de Testes Completo

## 1. TESTES DE AUTENTICAÇÃO

### 1.1 Login
- [ ] Login com email válido e senha correta
- [ ] Login com email inválido
- [ ] Login com senha incorreta
- [ ] Login case-insensitive (ADMIN@CORINGA.COM = admin@coringa.com)
- [ ] Redirecionamento automático para dashboard correto
- [ ] Token salvo no localStorage

### 1.2 Logout
- [ ] Botão logout funciona
- [ ] Redireciona para login.html
- [ ] Token removido do localStorage
- [ ] Sessão encerrada

### 1.3 Mudança de Senha
- [ ] Página acessível após primeiro login
- [ ] Validação de requisitos de segurança
- [ ] Confirmação de senha funciona
- [ ] Senha atualizada no banco
- [ ] Flag needsPasswordChange marcado como false

---

## 2. TESTES DO DASHBOARD ALUNO

### 2.1 Exibição de Dados
- [ ] Avatar exibido corretamente
- [ ] Nome do aluno exibido
- [ ] Email exibido
- [ ] Faixa exibido com cor correta
- [ ] Estatísticas carregadas (total, presentes, ausentes, %)

### 2.2 Histórico de Presença
- [ ] Tabela carrega com dados reais
- [ ] Datas formatadas corretamente (dd/mm/yyyy)
- [ ] Status exibido (Presente/Ausente)
- [ ] Cores dos badges corretas

### 2.3 Mensalidade
- [ ] Status de pagamento exibido
- [ ] Valores corretos
- [ ] Datas de vencimento exibidas
- [ ] Cores de status corretas

### 2.4 Avatar Customizer
- [ ] Página acessível
- [ ] Seletor de faixa funciona
- [ ] Preview do kimoninho atualiza
- [ ] Upload de foto funciona
- [ ] Avatar salvo no banco

---

## 3. TESTES DO DASHBOARD PROFESSOR

### 3.1 Gestão de Alunos
- [ ] Tabela carrega com alunos
- [ ] Filtro por nome funciona
- [ ] Filtro por faixa funciona
- [ ] Edição inline funciona
- [ ] Deletar aluno funciona
- [ ] Botão adicionar aluno funciona

### 3.2 Gestão de Aulas
- [ ] Tabela carrega com aulas
- [ ] Filtro por nível funciona
- [ ] Edição inline funciona
- [ ] Deletar aula funciona
- [ ] Botão adicionar aula funciona

### 3.3 Importação de Dados
- [ ] Download de planilha de alunos funciona
- [ ] Download de planilha de aulas funciona
- [ ] Download de formulário em branco funciona
- [ ] Upload de planilha funciona
- [ ] Validação de dados funciona

---

## 4. TESTES DO DASHBOARD ADMIN

### 4.1 Estatísticas
- [ ] Total de usuários exibido
- [ ] Total de professores exibido
- [ ] Total de alunos exibido
- [ ] Números correspondem ao banco

### 4.2 Gestão de Usuários
- [ ] Tabela carrega com usuários
- [ ] Filtro por nome funciona
- [ ] Filtro por tipo funciona
- [ ] Filtro por faixa funciona
- [ ] Edição inline funciona
- [ ] Deletar usuário funciona

---

## 5. TESTES DE RESPONSIVIDADE

### 5.1 Desktop (1920x1080)
- [ ] Layout completo
- [ ] Todos os elementos visíveis
- [ ] Tabelas sem scroll horizontal

### 5.2 Tablet (768x1024)
- [ ] Layout ajustado
- [ ] Botões acessíveis
- [ ] Tabelas com scroll

### 5.3 Mobile (375x667)
- [ ] Layout mobile
- [ ] Botões com tamanho adequado
- [ ] Inputs com font-size 16px (sem zoom iOS)
- [ ] Sem overflow horizontal

### 5.4 iPhone X (375x812)
- [ ] Safe area respeitado
- [ ] Notch não cobre conteúdo

---

## 6. TESTES DE PERFORMANCE

### 6.1 Carregamento
- [ ] Página carrega em < 3 segundos
- [ ] Imagens otimizadas
- [ ] CSS minificado
- [ ] JavaScript otimizado

### 6.2 Banco de Dados
- [ ] Queries otimizadas
- [ ] Sem N+1 queries
- [ ] Índices criados

---

## 7. TESTES DE SEGURANÇA

### 7.1 Autenticação
- [ ] Token JWT válido
- [ ] Expiração de token
- [ ] CORS configurado corretamente

### 7.2 Autorização
- [ ] Aluno não acessa dashboard professor
- [ ] Professor não acessa dashboard admin
- [ ] Admin tem acesso total

### 7.3 Validação de Dados
- [ ] Inputs validados no cliente
- [ ] Inputs validados no servidor
- [ ] SQL injection prevenido
- [ ] XSS prevenido

---

## 8. TESTES DE FUNCIONALIDADES ESPECÍFICAS

### 8.1 QR Code
- [ ] Geração de QR code funciona
- [ ] Scanner lê QR code
- [ ] Check-in registrado no banco
- [ ] Histórico atualizado

### 8.2 Avatar
- [ ] 15 cores de faixa disponíveis
- [ ] Kimoninho SVG renderiza corretamente
- [ ] Upload de foto funciona
- [ ] Avatar salvo no banco
- [ ] Avatar exibido no dashboard

### 8.3 Mensalidade
- [ ] Status Pago exibido
- [ ] Status Pendente exibido
- [ ] Status Vencido exibido
- [ ] Cores corretas

---

## 9. TESTES DE NAVEGAÇÃO

### 9.1 Links
- [ ] Todos os links funcionam
- [ ] Redirecionamentos corretos
- [ ] Sem links quebrados

### 9.2 Menu
- [ ] Menu responsivo
- [ ] Ativo/inativo correto
- [ ] Cliques funcionam

---

## 10. TESTES DE COMPATIBILIDADE

### 10.1 Navegadores
- [ ] Chrome (Desktop + Mobile)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop + iOS)
- [ ] Edge (Desktop)

### 10.2 Sistemas Operacionais
- [ ] Windows
- [ ] macOS
- [ ] Linux
- [ ] iOS
- [ ] Android

---

## Resultado dos Testes

| Categoria | Status | Observações |
|-----------|--------|------------|
| Autenticação | ⏳ | Em testes |
| Dashboard Aluno | ⏳ | Em testes |
| Dashboard Professor | ⏳ | Em testes |
| Dashboard Admin | ⏳ | Em testes |
| Responsividade | ⏳ | Em testes |
| Performance | ⏳ | Em testes |
| Segurança | ⏳ | Em testes |
| Funcionalidades | ⏳ | Em testes |
| Navegação | ⏳ | Em testes |
| Compatibilidade | ⏳ | Em testes |

---

## Notas Importantes

1. Todos os testes devem ser feitos em ambiente de produção (Railway)
2. Testar em múltiplos navegadores e dispositivos
3. Verificar console do navegador para erros
4. Testar com dados reais do banco
5. Testar fluxos completos (login → ação → logout)

---

## Data de Conclusão

- Início: 03/02/2026
- Conclusão: ⏳ Pendente
