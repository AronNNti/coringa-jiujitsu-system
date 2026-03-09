import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NODE_ENV === 'production' ? 'https://www.coringajiujitsu.com.br/api' : 'http://localhost:3000/api'

export default function AlunoDashboard({ user }) {
  const [aluno, setAluno] = useState(null)
  const [presencas, setPresencas] = useState([])
  const [qrCodeInput, setQrCodeInput] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadAlunoData()
  }, [])

  async function loadAlunoData() {
    try {
      // Aqui você carregaria os dados do aluno
      // Por enquanto, vamos usar dados de exemplo
      setAluno({
        id: 1,
        name: user.email,
        faixa: 'azul',
        mensalidade_status: 'paga',
        data_graduacao_prevista: '2025-06-01'
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  async function handleCheckIn(e) {
    e.preventDefault()
    try {
      const aulaId = qrCodeInput.split('/').pop()
      await axios.post(`${API_URL}/aulas/${aulaId}/checkin`, {
        aluno_id: aluno.id
      })
      alert('Check-in realizado com sucesso!')
      setQrCodeInput('')
      setShowModal(false)
    } catch (error) {
      alert('Erro ao fazer check-in: ' + error.response?.data?.error)
    }
  }

  if (!aluno) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>
  }

  const faixaColors = {
    branca: '#f0f0f0',
    azul: '#0066ff',
    roxa: '#9933ff',
    marrom: '#8b4513',
    preta: '#000'
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        background: faixaColors[aluno.faixa],
        color: aluno.faixa === 'branca' ? '#000' : '#fff',
        padding: '40px',
        borderRadius: '8px',
        marginBottom: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>🥋 {aluno.faixa.toUpperCase()}</h1>
        <p style={{ fontSize: '18px' }}>Sua graduação atual</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Mensalidade</h3>
          <div className="value" style={{ color: aluno.mensalidade_status === 'paga' ? '#00ff00' : '#ff3333' }}>
            {aluno.mensalidade_status === 'paga' ? '✅ Paga' : '❌ Pendente'}
          </div>
        </div>

        <div className="stat-card">
          <h3>Próxima Graduação</h3>
          <div className="value" style={{ fontSize: '16px' }}>
            {new Date(aluno.data_graduacao_prevista).toLocaleDateString('pt-BR')}
          </div>
        </div>

        <div className="stat-card">
          <h3>Presença</h3>
          <div className="value">{presencas.length} aulas</div>
        </div>
      </div>

      <div style={{ background: '#1a1a1a', padding: '40px', borderRadius: '8px', marginTop: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>Fazer Check-in</h2>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
          style={{ padding: '15px 30px', fontSize: '16px' }}
        >
          📱 Escanear QR Code
        </button>
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Check-in por QR Code</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCheckIn}>
              <div className="form-group">
                <label>Cole o link do QR Code ou ID da Aula</label>
                <input
                  type="text"
                  placeholder="http://localhost:3000/checkin/123 ou 123"
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Confirmar Check-in
              </button>
            </form>

            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '20px', textAlign: 'center' }}>
              💡 Dica: Escanear o QR Code da aula com seu celular para fazer check-in automaticamente
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
