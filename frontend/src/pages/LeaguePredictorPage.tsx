import { useNavigate } from 'react-router-dom'
import { getToken } from '../auth'

export default function PredictionPage() {
  const navigate = useNavigate()
  const token = getToken()
  if (!token) navigate('/')
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>League Predictor</h1>
          <p style={styles.subtitle}>Premier League 2026–27</p>
        </div>

        <div style={styles.cards}>
          <button style={styles.card} className='hub-card' onClick={() => navigate('/predict/my')}>
            <span style={styles.cardIcon}>✦</span>
            <span style={styles.cardTitle}>My Prediction</span>
            <span style={styles.cardDesc}>Set or update your predicted table</span>
          </button>

          <button style={styles.card} className='hub-card' onClick={() => navigate('/predict/others')}>
            <span style={styles.cardIcon}>◈</span>
            <span style={styles.cardTitle}>View Predictions</span>
            <span style={styles.cardDesc}>See how everyone else is predicting</span>
          </button>
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
    width: '100%',
    maxWidth: '480px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '3.5rem',
    letterSpacing: '0.05em',
    color: 'var(--accent)',
    lineHeight: 1,
  },
  subtitle: {
    color: 'var(--muted)',
    marginTop: '8px',
    fontSize: '0.95rem',
  },
  cards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '28px 32px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    width: '100%',
  },
  cardIcon: {
    fontSize: '1.4rem',
    color: 'var(--accent)',
    marginBottom: '4px',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem',
    letterSpacing: '0.04em',
    color: 'var(--text)',
  },
  cardDesc: {
    fontSize: '0.875rem',
    color: 'var(--muted)',
    fontWeight: 400,
  },
}