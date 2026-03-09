import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NODE_ENV === 'production' ? 'https://www.coringajiujitsu.com.br/api' : 'http://localhost:3000/api'

export default function Home({ setCurrentPage }) {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    loadVideos()
  }, [])

  async function loadVideos() {
    try {
      const response = await axios.get(`${API_URL}/videos`)
      setVideos(response.data)
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error)
    }
  }

  return (
    <div>
      <section className="hero" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)', padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#ffd700', fontWeight: '600', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Sistema Inteligente de Presença
            </div>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', background: 'linear-gradient(135deg, #ffd700, #ffed4e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-1px' }}>
              Dojo Check
            </h1>
            <p style={{ fontSize: '18px', color: '#ccc', marginBottom: '30px', lineHeight: '1.8' }}>
              Gerencie presenças, acompanhe evolução e promova alunos com facilidade. Sistema completo para academias de Jiu-Jitsu com painel para professores, app para alunos, check-in via QR Code dinâmico, gerenciamento de aulas, histórico de presença e controle de graduações.
            </p>
            <div className="hero-buttons" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => setCurrentPage('login')} style={{ padding: '15px 30px', background: 'linear-gradient(135deg, #ffd700, #ffed4e)', color: '#000', border: 'none', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)' }}>
                Entrar
              </button>
              <button className="btn-secondary" onClick={() => document.querySelector('.videos-section').scrollIntoView({ behavior: 'smooth' })} style={{ padding: '15px 30px', background: 'transparent', color: '#ffd700', border: '2px solid #ffd700', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)' }}>
                Ver Vídeos
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '350px', height: '350px', margin: '0 auto', borderRadius: '50%', border: '4px solid #ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 30% 30%, rgba(255, 193, 7, 0.1), transparent)', boxShadow: '0 0 40px rgba(255, 193, 7, 0.3), inset 0 0 40px rgba(255, 193, 7, 0.1)', animation: 'glow 2s ease-in-out infinite' }}>
              <img src="/sapo-logo.png" alt="Logo Sapo" style={{ width: '280px', height: '280px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(255, 193, 7, 0.3))' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="videos-section">
        <div className="container">
          <h2>Biblioteca de Vídeos Técnicos</h2>
          {videos.length > 0 ? (
            <div className="videos-grid">
              {videos.map(video => {
                const videoId = video.url_youtube.split('v=')[1] || video.url_youtube.split('/').pop()
                return (
                  <div key={video.id} className="video-card">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      allowFullScreen
                    ></iframe>
                    <div className="video-info">
                      <h3>{video.titulo}</h3>
                      <p>{video.descricao || 'Vídeo técnico'}</p>
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Por: {video.professor}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
              <p>Nenhum vídeo disponível no momento</p>
            </div>
          )}
        </div>
      </section>

      <footer style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 100%)', padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255, 193, 7, 0.2)', color: '#999', marginTop: '60px' }}>
        <p style={{ marginBottom: '10px' }}>© 2026 Dojo Check - Sistema de Presença</p>
        <p style={{ color: '#ffd700', fontWeight: '600' }}>Desenvolvido por Aron Nascimento</p>
      </footer>

      <style>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 193, 7, 0.3), inset 0 0 40px rgba(255, 193, 7, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 193, 7, 0.6), inset 0 0 40px rgba(255, 193, 7, 0.2);
          }
        }
        
        @media (max-width: 1024px) {
          .hero > .container {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
        }
      `}</style>
    </div>
  )
}
