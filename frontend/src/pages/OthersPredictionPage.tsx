import { useNavigate } from 'react-router-dom'
import { getToken } from '../auth'

export default function OthersPredictionPage() {
  const token = getToken()
  const navigate = useNavigate()
  if (!token) navigate('/')
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>ALL PREDICTIONS</h1>
        <p style={styles.muted}>Coming soon — predictions from all participants will appear here.</p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: '40px 24px',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.5rem',
    letterSpacing: '0.05em',
    color: 'var(--accent)',
    marginBottom: '16px',
  },
  muted: {
    color: 'var(--muted)',
    fontSize: '0.95rem',
  },
}