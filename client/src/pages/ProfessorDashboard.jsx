import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NODE_ENV === 'production' ? 'https://www.coringajiujitsu.com.br/api' : 'http://localhost:3000/api'

export default function ProfessorDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('alunos')
  const [alunos, setAlunos] = useState([])
  const [aulas, setAulas] = useState([])
  const [videos, setVideos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [formData, setFormData] = useState({})
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    try {
      if (activeTab === 'alunos') {
        const response = await axios.get(`${API_URL}/alunos`)
        setAlunos(response.data)
      } else if (activeTab === 'aulas') {
        const response = await axios.get(`${API_URL}/aulas`)
        setAulas(response.data)
      } else if (activeTab === 'videos') {
        const response = await axios.get(`${API_URL}/videos`)
        setVideos(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  async function handleCreateAluno(e) {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/alunos`, formData)
      setShowModal(false)
      setFormData({})
      loadData()
      alert('Aluno criado com sucesso!')
    } catch (error) {
      alert('Erro ao criar aluno: ' + error.response?.data?.error)
    }
  }

  async function handleCreateAula(e) {
    e.preventDefault()
    try {
      const response = await axios.post(`${API_URL}/aulas`, {
        professor_id: user.id,
        ...formData
      })
      setQrCode(response.data.qrCode)
      setShowModal(false)
      setFormData({})
      loadData()
    } catch (error) {
      alert('Erro ao criar aula: ' + error.response?.data?.error)
    }
  }

  async function handleCreateVideo(e) {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/videos`, {
        professor_id: user.id,
        ...formData
      })
      setShowModal(false)
      setFormData({})
      loadData()
      alert('Vídeo adicionado com sucesso!')
    } catch (error) {
      alert('Erro ao adicionar vídeo: ' + error.response?.data?.error)
    }
  }

  async function handleDeleteAluno(id) {
    if (confirm('Tem certeza que deseja deletar este aluno?')) {
      try {
        await axios.delete(`${API_URL}/alunos/${id}`)
        loadData()
        alert('Aluno deletado com sucesso!')
      } catch (error) {
        alert('Erro ao deletar aluno')
      }
    }
  }

  async function handleDeleteVideo(id) {
    if (confirm('Tem certeza que deseja deletar este vídeo?')) {
      try {
        await axios.delete(`${API_URL}/videos/${id}`)
        loadData()
        alert('Vídeo deletado com sucesso!')
      } catch (error) {
        alert('Erro ao deletar vídeo')
      }
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <div className="sidebar">
        <div style={{ padding: '20px', borderBottom: '1px solid #333', marginBottom: '20px' }}>
          <h3 style={{ color: '#ffd700' }}>Professor</h3>
          <p style={{ fontSize: '12px', color: '#aaa' }}>{user.email}</p>
        </div>
        <div className={`sidebar-item ${activeTab === 'alunos' ? 'active' : ''}`} onClick={() => setActiveTab('alunos')}>
          👥 Alunos
        </div>
        <div className={`sidebar-item ${activeTab === 'aulas' ? 'active' : ''}`} onClick={() => setActiveTab('aulas')}>
          📅 Aulas
        </div>
        <div className={`sidebar-item ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>
          🎥 Vídeos
        </div>
      </div>

      <div className="dashboard-content" style={{ flex: 1 }}>
        <h1 style={{ marginBottom: '30px' }}>Dashboard do Professor</h1>

        {activeTab === 'alunos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Gerenciar Alunos</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setModalType('aluno')
                  setShowModal(true)
                }}
              >
                + Novo Aluno
              </button>
            </div>

            {alunos.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Faixa</th>
                    <th>Mensalidade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map(aluno => (
                    <tr key={aluno.id}>
                      <td>{aluno.name}</td>
                      <td>{aluno.email}</td>
                      <td>
                        <span className={`faixa-badge faixa-${aluno.faixa}`}>
                          {aluno.faixa}
                        </span>
                      </td>
                      <td>{aluno.mensalidade_status === 'paga' ? '✅ Paga' : '❌ Pendente'}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteAluno(aluno.id)}
                          style={{
                            background: '#ff3333',
                            color: '#fff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>Nenhum aluno cadastrado</p>
            )}
          </div>
        )}

        {activeTab === 'aulas' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Gerenciar Aulas</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setModalType('aula')
                  setShowModal(true)
                }}
              >
                + Nova Aula
              </button>
            </div>

            {aulas.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Data/Hora</th>
                    <th>QR Code</th>
                  </tr>
                </thead>
                <tbody>
                  {aulas.map(aula => (
                    <tr key={aula.id}>
                      <td>{aula.titulo}</td>
                      <td>{new Date(aula.data_hora).toLocaleString('pt-BR')}</td>
                      <td>
                        <button
                          className="btn-secondary"
                          onClick={async () => {
                            const response = await axios.get(`${API_URL}/aulas/${aula.id}/qrcode`)
                            setQrCode(response.data.qrCode)
                            setShowModal(true)
                            setModalType('qrcode')
                          }}
                        >
                          Ver QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>Nenhuma aula cadastrada</p>
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Gerenciar Vídeos</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setModalType('video')
                  setShowModal(true)
                }}
              >
                + Novo Vídeo
              </button>
            </div>

            {videos.length > 0 ? (
              <div className="videos-grid">
                {videos.map(video => (
                  <div key={video.id} className="video-card">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.url_youtube.split('v=')[1] || video.url_youtube.split('/').pop()}`}
                      allowFullScreen
                    ></iframe>
                    <div className="video-info">
                      <h3>{video.titulo}</h3>
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        style={{
                          background: '#ff3333',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginTop: '10px',
                          width: '100%'
                        }}
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>Nenhum vídeo cadastrado</p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {modalType === 'aluno' && 'Novo Aluno'}
                {modalType === 'aula' && 'Nova Aula'}
                {modalType === 'video' && 'Novo Vídeo'}
                {modalType === 'qrcode' && 'QR Code da Aula'}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {modalType === 'qrcode' ? (
              <div style={{ textAlign: 'center' }}>
                {qrCode && <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%', marginBottom: '20px' }} />}
                <button
                  className="btn-primary"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = qrCode
                    link.download = 'qrcode.png'
                    link.click()
                  }}
                >
                  Baixar QR Code
                </button>
              </div>
            ) : (
              <form onSubmit={
                modalType === 'aluno' ? handleCreateAluno :
                modalType === 'aula' ? handleCreateAula :
                handleCreateVideo
              }>
                {modalType === 'aluno' && (
                  <>
                    <div className="form-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Faixa</label>
                      <select value={formData.faixa || 'branca'} onChange={(e) => setFormData({ ...formData, faixa: e.target.value })}>
                        <option value="branca">Branca</option>
                        <option value="azul">Azul</option>
                        <option value="roxa">Roxa</option>
                        <option value="marrom">Marrom</option>
                        <option value="preta">Preta</option>
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'aula' && (
                  <>
                    <div className="form-group">
                      <label>Título</label>
                      <input
                        type="text"
                        value={formData.titulo || ''}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Data e Hora</label>
                      <input
                        type="datetime-local"
                        value={formData.data_hora || ''}
                        onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {modalType === 'video' && (
                  <>
                    <div className="form-group">
                      <label>Título</label>
                      <input
                        type="text"
                        value={formData.titulo || ''}
                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>URL do YouTube</label>
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formData.url_youtube || ''}
                        onChange={(e) => setFormData({ ...formData, url_youtube: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Descrição</label>
                      <textarea
                        value={formData.descricao || ''}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        rows="3"
                      ></textarea>
                    </div>
                  </>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  {modalType === 'aluno' && 'Criar Aluno'}
                  {modalType === 'aula' && 'Criar Aula'}
                  {modalType === 'video' && 'Adicionar Vídeo'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
