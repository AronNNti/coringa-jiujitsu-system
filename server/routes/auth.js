import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../db.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === "production";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return "Senha deve ter no mínimo 8 caracteres";
  }

  if (!/[A-Z]/.test(password)) {
    return "Senha deve conter pelo menos 1 letra maiúscula";
  }

  if (!/[a-z]/.test(password)) {
    return "Senha deve conter pelo menos 1 letra minúscula";
  }

  if (!/[0-9]/.test(password)) {
    return "Senha deve conter pelo menos 1 número";
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-\\/\[\];+=]/.test(password)) {
    return "Senha deve conter pelo menos 1 caractere especial";
  }

  return null;
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  return req.cookies?.token || bearerToken || null;
}

function requireJwtSecret(res) {
  if (!JWT_SECRET) {
    res.status(500).json({ error: "JWT_SECRET não configurado no servidor" });
    return false;
  }
  return true;
}

function signUserToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

// Registrar novo usuário
router.post("/register", async (req, res) => {
  let connection;

  try {
    if (!requireJwtSecret(res)) return;

    const { email, password, name, role } = req.body;

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const normalizedName = String(name || "").trim();

    if (!normalizedEmail || !password || !normalizedName || !role) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    if (role !== "professor" && role !== "aluno") {
      return res.status(400).json({ error: "Role inválido" });
    }

    connection = await pool.getConnection();

    const [existing] = await connection.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
      [normalizedEmail],
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await connection.query(
      "INSERT INTO users (email, password, name, role, needsPasswordChange) VALUES (?, ?, ?, ?, 0)",
      [normalizedEmail, hashedPassword, normalizedName, role],
    );

    return res.json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    return res.status(500).json({ error: "Erro ao registrar usuário" });
  } finally {
    if (connection) connection.release();
  }
});

// Login
router.post("/login", async (req, res) => {
  let connection;

  try {
    if (!requireJwtSecret(res)) return;

    const { email, password } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email e senha obrigatórios" });
    }

    connection = await pool.getConnection();

    const [users] = await connection.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
      [normalizedEmail],
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const token = signUserToken(user);

    res.cookie("token", token, getCookieOptions());

    const needsPasswordChange = !!user.needsPasswordChange;

    return res.json({
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        needsPasswordChange,
      },
      token,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  } finally {
    if (connection) connection.release();
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  return res.json({ message: "Logout realizado com sucesso" });
});

// Verificar autenticação
router.get("/me", async (req, res) => {
  let connection;

  try {
    if (!requireJwtSecret(res)) return;

    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    connection = await pool.getConnection();
    const [users] = await connection.query(
      "SELECT id, email, name, role, needsPasswordChange FROM users WHERE id = ? LIMIT 1",
      [decoded.id],
    );

    if (!users.length) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = users[0];

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      needsPasswordChange: !!user.needsPasswordChange,
    });
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  } finally {
    if (connection) connection.release();
  }
});

// Alterar senha
router.post("/change-password", async (req, res) => {
  let connection;

  try {
    if (!requireJwtSecret(res)) return;

    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Senha atual e nova senha obrigatórias" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    connection = await pool.getConnection();

    const [users] = await connection.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [decoded.id],
    );

    if (!users.length) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Senha atual incorreta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await connection.query(
      "UPDATE users SET password = ?, needsPasswordChange = 0 WHERE id = ?",
      [hashedPassword, decoded.id],
    );

    return res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ message: "Erro ao alterar senha" });
  } finally {
    if (connection) connection.release();
  }
});

// Esqueci minha senha - etapa 1
router.post("/forgot-password", async (req, res) => {
  let connection;

  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    connection = await pool.getConnection();

    const [users] = await connection.query(
      "SELECT id, email FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
      [normalizedEmail],
    );

    // Resposta neutra por segurança
    if (!users.length) {
      return res.json({
        message:
          "Se o email existir, você receberá instruções para redefinir a senha",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

    await connection.query(
      `
      UPDATE users
      SET resetPasswordToken = ?, resetPasswordExpiresAt = ?
      WHERE id = ?
      `,
      [resetToken, resetTokenExpiresAt, users[0].id],
    );

    // Por enquanto, só retorna o token para teste local.
    // Depois vamos trocar isso por envio real por email.
    return res.json({
      message:
        "Se o email existir, você receberá instruções para redefinir a senha",
      resetToken,
    });
  } catch (error) {
    console.error("Erro em forgot-password:", error);
    return res
      .status(500)
      .json({ error: "Erro ao solicitar redefinição de senha" });
  } finally {
    if (connection) connection.release();
  }
});

// Esqueci minha senha - etapa 2
router.post("/reset-password", async (req, res) => {
  let connection;

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token e nova senha são obrigatórios" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    connection = await pool.getConnection();

    const [users] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE resetPasswordToken = ?
        AND resetPasswordExpiresAt IS NOT NULL
        AND resetPasswordExpiresAt > NOW()
      LIMIT 1
      `,
      [token],
    );

    if (!users.length) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await connection.query(
      `
      UPDATE users
      SET password = ?,
          needsPasswordChange = 0,
          resetPasswordToken = NULL,
          resetPasswordExpiresAt = NULL
      WHERE id = ?
      `,
      [hashedPassword, users[0].id],
    );

    return res.json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error("Erro em reset-password:", error);
    return res.status(500).json({ error: "Erro ao redefinir senha" });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
