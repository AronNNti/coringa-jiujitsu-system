import { useState } from "react";
import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.coringajiujitsu.com.br/api"
    : "http://localhost:3000/api";

export default function Login({ setCurrentPage, setUser, checkAuth }) {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("aluno");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetToken, setResetToken] = useState("");

  function resetMessages() {
    setError("");
    setSuccess("");
    setResetToken("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true },
      );

      setUser(response.data.user);
      await checkAuth();

      if (response.data.user.role === "admin") {
        setCurrentPage("admin-dashboard");
      } else if (response.data.user.role === "professor") {
        setCurrentPage("professor-dashboard");
      } else {
        setCurrentPage("aluno-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
        role,
      });

      setSuccess("Cadastro realizado com sucesso. Faça login agora.");
      setPassword("");
      setName("");
      setMode("login");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      setSuccess(response.data?.message || "Solicitação enviada com sucesso.");

      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Erro ao solicitar recuperação de senha",
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    resetMessages();
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 80px)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#111",
          padding: "40px",
          borderRadius: "16px",
          maxWidth: "420px",
          width: "100%",
          border: "1px solid rgba(255, 215, 0, 0.25)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
            fontSize: "32px",
            color: "#ffd700",
          }}
        >
          {mode === "login" && "Login"}
          {mode === "register" && "Criar Conta"}
          {mode === "forgot" && "Recuperar Senha"}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#bbb",
            marginBottom: "30px",
          }}
        >
          {mode === "login" && "Acesse sua conta"}
          {mode === "register" && "Preencha os dados para criar sua conta"}
          {mode === "forgot" && "Informe seu email para recuperar a senha"}
        </p>

        {error && (
          <div
            style={{
              background: "#8b1e1e",
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              background: "#1e6b2d",
              color: "#fff",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

        {resetToken && (
          <div
            style={{
              background: "#1f1f1f",
              color: "#ffd700",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "13px",
              wordBreak: "break-all",
              border: "1px solid rgba(255, 215, 0, 0.2)",
            }}
          >
            <strong>Token de teste:</strong>
            <br />
            {resetToken}
          </div>
        )}

        <form
          onSubmit={
            mode === "login"
              ? handleLogin
              : mode === "register"
                ? handleRegister
                : handleForgotPassword
          }
        >
          {mode === "register" && (
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{ display: "block", marginBottom: "8px", color: "#fff" }}
              >
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: "18px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", color: "#fff" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={inputStyle}
              placeholder="seuemail@exemplo.com"
            />
          </div>

          {mode !== "forgot" && (
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{ display: "block", marginBottom: "8px", color: "#fff" }}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength="8"
                style={inputStyle}
                placeholder="Digite sua senha"
              />
            </div>
          )}

          {mode === "register" && (
            <div style={{ marginBottom: "22px" }}>
              <label
                style={{ display: "block", marginBottom: "8px", color: "#fff" }}
              >
                Tipo de Conta
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                style={inputStyle}
              >
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading && "Carregando..."}
            {!loading && mode === "login" && "Entrar"}
            {!loading && mode === "register" && "Criar Conta"}
            {!loading && mode === "forgot" && "Enviar recuperação"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "18px" }}>
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                style={linkButtonStyle}
              >
                Esqueceu a senha?
              </button>

              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  style={linkButtonStyle}
                >
                  Não tem conta? Criar
                </button>
              </div>
            </>
          )}

          {mode === "register" && (
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={linkButtonStyle}
            >
              Já tem conta? Entrar
            </button>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={linkButtonStyle}
            >
              Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid rgba(255, 215, 0, 0.4)",
  background: "#1b1b1b",
  color: "#fff",
  outline: "none",
  fontSize: "15px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "#ffd700",
  color: "#000",
  border: "none",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(255, 215, 0, 0.25)",
};

const linkButtonStyle = {
  background: "none",
  border: "none",
  color: "#ffd700",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: "14px",
};
