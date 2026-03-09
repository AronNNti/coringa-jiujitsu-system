import express from 'express';
import ExcelJS from 'exceljs';
import pool from '../db.js';

const router = express.Router();

/**
 * GET /api/excel/students
 * Baixa planilha com lista de alunos
 */
router.get('/students', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [students] = await connection.query(
      `SELECT id, name, email, belt, createdAt FROM users 
       WHERE role = 'aluno' 
       ORDER BY name ASC`
    );
    
    connection.release();
    
    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Alunos');
    
    // Adicionar headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Faixa', key: 'belt', width: 20 },
      { header: 'Data de Cadastro', key: 'createdAt', width: 20 }
    ];
    
    // Estilizar header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC107' } };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };
    
    // Adicionar dados
    students.forEach(student => {
      worksheet.addRow({
        id: student.id,
        name: student.name,
        email: student.email,
        belt: student.belt || 'N/A',
        createdAt: new Date(student.createdAt).toLocaleDateString('pt-BR')
      });
    });
    
    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="alunos.xlsx"');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao gerar planilha de alunos:', error);
    res.status(500).json({ error: 'Erro ao gerar planilha' });
  }
});

/**
 * GET /api/excel/classes
 * Baixa planilha com lista de aulas
 */
router.get('/classes', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [classes] = await connection.query(
      `SELECT id, name, time, location, level, createdAt FROM classes 
       ORDER BY time ASC`
    );
    
    connection.release();
    
    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Aulas');
    
    // Adicionar headers
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nome da Aula', key: 'name', width: 30 },
      { header: 'Horário', key: 'time', width: 15 },
      { header: 'Local', key: 'location', width: 25 },
      { header: 'Nível', key: 'level', width: 20 },
      { header: 'Data de Criação', key: 'createdAt', width: 20 }
    ];
    
    // Estilizar header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC107' } };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };
    
    // Adicionar dados
    classes.forEach(cls => {
      worksheet.addRow({
        id: cls.id,
        name: cls.name,
        time: cls.time,
        location: cls.location,
        level: cls.level,
        createdAt: new Date(cls.createdAt).toLocaleDateString('pt-BR')
      });
    });
    
    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="aulas.xlsx"');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao gerar planilha de aulas:', error);
    res.status(500).json({ error: 'Erro ao gerar planilha' });
  }
});

/**
 * GET /api/excel/blank-student-form
 * Baixa planilha em branco para novo aluno preencher
 */
router.get('/blank-student-form', async (req, res) => {
  try {
    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Novo Aluno');
    
    // Adicionar instruções
    worksheet.addRow(['FORMULÁRIO DE FILIAÇÃO - CORINGA JIU-JITSU']);
    worksheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FFC107' } };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };
    worksheet.mergeCells('A1:F1');
    
    worksheet.addRow([]);
    worksheet.addRow(['Preencha todos os campos abaixo:']);
    worksheet.getRow(3).font = { italic: true, color: { argb: '999999' } };
    
    worksheet.addRow([]);
    
    // Adicionar campos
    const fields = [
      { label: 'Nome Completo', key: 'name', width: 30 },
      { label: 'Email', key: 'email', width: 30 },
      { label: 'Telefone', key: 'phone', width: 20 },
      { label: 'Data de Nascimento (DD/MM/YYYY)', key: 'birthDate', width: 20 },
      { label: 'Endereço', key: 'address', width: 40 },
      { label: 'Faixa Atual', key: 'belt', width: 20 },
      { label: 'Experiência em Jiu-Jitsu (Sim/Não)', key: 'experience', width: 20 },
      { label: 'Observações', key: 'observations', width: 40 }
    ];
    
    let row = 5;
    fields.forEach(field => {
      worksheet.addRow([field.label]);
      worksheet.getRow(row).font = { bold: true, color: { argb: 'FFC107' } };
      worksheet.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '333333' } };
      
      row++;
      worksheet.addRow(['']);
      worksheet.getRow(row).height = 25;
      row++;
    });
    
    // Ajustar largura das colunas
    worksheet.columns = [
      { width: 50 }
    ];
    
    // Enviar arquivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="formulario-filiacao.xlsx"');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao gerar formulário em branco:', error);
    res.status(500).json({ error: 'Erro ao gerar formulário' });
  }
});

export default router;

/**
 * POST /api/excel/import-students
 * Importa alunos de uma planilha Excel/CSV
 */
router.post('/import-students', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'Arquivo não fornecido' });
    }

    const file = req.files.file;
    const workbook = new ExcelJS.Workbook();
    
    await workbook.xlsx.load(file.data);
    const worksheet = workbook.getWorksheet(1);
    
    const connection = await pool.getConnection();
    let importedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Processar linhas (começando da linha 2, pulando header)
    for (let rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
      const row = worksheet.getRow(rowNum);
      const name = row.getCell(1).value;
      const email = row.getCell(2).value;
      const phone = row.getCell(3).value;
      const birthDate = row.getCell(4).value;
      const address = row.getCell(5).value;
      const belt = row.getCell(6).value || 'branca';

      // Validar campos obrigatórios
      if (!name || !email) {
        errorCount++;
        errors.push(`Linha ${rowNum}: Nome e email são obrigatórios`);
        continue;
      }

      try {
        // Verificar se email já existe
        const [existing] = await connection.query(
          'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
          [email]
        );

        if (existing.length > 0) {
          errorCount++;
          errors.push(`Linha ${rowNum}: Email ${email} já cadastrado`);
          continue;
        }

        // Inserir novo aluno
        await connection.query(
          'INSERT INTO users (name, email, belt, role, openId, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
          [name, email, belt, 'aluno', `aluno-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`]
        );

        importedCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Linha ${rowNum}: ${error.message}`);
      }
    }

    connection.release();

    res.json({
      success: true,
      importedCount,
      errorCount,
      errors: errors.slice(0, 10),
      message: `${importedCount} aluno(s) importado(s) com sucesso. ${errorCount} erro(s) encontrado(s).`
    });
  } catch (error) {
    console.error('Erro ao importar alunos:', error);
    res.status(500).json({ error: 'Erro ao processar arquivo: ' + error.message });
  }
});
