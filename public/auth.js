// auth.js - controle simples de autenticação

function setAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

// proteger páginas
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "/login.html";
  }
}

// proteger admin
function requireAdmin() {
  const user = getUser();
  if (!user || user.role !== "admin") {
    window.location.href = "/login.html";
  }
}
