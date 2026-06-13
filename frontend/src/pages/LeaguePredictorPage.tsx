import { useNavigate, useSearchParams } from 'react-router-dom'
import { getToken, saveSession } from '../auth'
import { useEffect } from 'react'

export default function PredictionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      saveSession(urlToken)
      window.history.replaceState({}, '', '/predict/my')
    } else if (!getToken()) {
      navigate('/')
    }
  }, [navigate])
  const token = getToken()
  if (!token) navigate('/')
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.seasonBadge}>2026–27 Season</div>
          <h1 style={styles.title}>
            That's <span style={styles.titleAccent}>Offside!</span>
          </h1>
        </div>
        <div className="stripe" />
        <div style={styles.body}>
          <p className="section-label">What would you like to do?</p>
          <div style={styles.cards}>
            <button style={styles.card} className='hub-card' onClick={() => navigate('/predict/my')}>
              <span style={styles.cardLabel}>✦ My Prediction</span>
              <span style={styles.cardDesc}>Set or update your predicted table</span>
            </button>

            <button style={styles.card} className='hub-card' onClick={() => navigate('/predict/others')}>
              <span style={styles.cardLabel}>◈ View Predictions</span>
              <span style={styles.cardDesc}>See how everyone else is predicting</span>
            </button>
          </div>
        </div>
        <div style={styles.footer}>
          <span style={styles.footerText}>That's Offside!</span>
          <span style={styles.footerText}>Free to play</span>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  container: {
    background: 'var(--surface)',
    border: '2px solid var(--border)',
    width: '100%',
    maxWidth: '440px',
    overflow: 'hidden',
  },
  header: {
    background: 'var(--border)',
    padding: '28px 28px 24px',
  },
  seasonBadge: {
    display: 'inline-block',
    background: 'var(--accent)',
    color: 'var(--surface)',
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    letterSpacing: '0.15em',
    padding: '3px 10px',
    marginBottom: '10px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '3.2rem',
    color: 'var(--surface)',
    lineHeight: 1,
    letterSpacing: '0.02em',
  },
  titleAccent: {
    color: 'var(--highlight)',
  },
  body: {
    padding: '28px',
  },
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  card: {
    background: 'var(--bg)',
    border: '2px solid var(--border)',
    padding: '20px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.15s',
  },
  cardLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.4rem',
    letterSpacing: '0.05em',
    color: 'var(--text)',
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: 'var(--muted)',
    fontWeight: 400,
  },
  footer: {
    background: 'var(--border)',
    padding: '6px 28px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.65rem',
    color: '#4A5568',
    letterSpacing: '0.12em',
  },
}