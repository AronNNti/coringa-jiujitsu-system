import { useState } from 'react'
import axios from 'axios'

const API_URL = process.env.NODE_ENV === 'production' ? 'https://www.coringajiujitsu.com.br/api' : 'http://localhost:3000/api'

export default function Login({ setCurrentPage, setUser, checkAuth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('aluno')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      })

      setUser(response.data.user)
      await checkAuth()

      if (response.data.user.role === 'professor') {
        setCurrentPage('professor-dashboard')
      } else {
        setCurrentPage('aluno-dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
        role
      })

      setError('')
      setEmail('')
      setPassword('')
      setName('')
      setIsRegistering(false)
      alert('Cadastro realizado com sucesso! Faça login agora.')
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
      <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '8px', maxWidth: '400px', width: '100%', border: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px' }}>
          {isRegistering ? 'Criar Conta' : 'Entrar'}
        </h2>

        {error && (
          <div style={{ background: '#ff3333', color: '#fff', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {isRegistering && (
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label>Tipo de Conta</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ffd700',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Carregando...' : isRegistering ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering)
              setError('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffd700',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegistering ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
          </button>
        </div>
      </div>
    </div>
  )
}
