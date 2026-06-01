import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailForm from '../components/EmailForm'
import SignUpForm from '../components/SignUpForm'

type View = 'email' | 'signup'
export default function WelcomePage() {
  const [view, setView] = useState<View>('email')
  const navigate = useNavigate()

  function handleEmailContinue(email: string) {
    // Later: check if user exists in Supabase
    // For now, go straight to sign up
    console.log('Email submitted:', email)
    setView('signup')
  }

  function handleSignUp(firstName: string, lastName: string, email: string) {
    // Later: call upsert_user, get token, send email
    console.log('Sign up:', firstName, lastName, email)
    navigate('/predict')
  }
  return (<div style={styles.page}>
    <div style={styles.card}>
      <div style={styles.header}>
        <h1 style={styles.title}>That's Offside!</h1>
        <p style={styles.subtitle}>League Predictor, and more!</p>
      </div>

      {view === 'email' && (
        <EmailForm
          onContinue={handleEmailContinue}
          onSignUp={() => setView('signup')}
        />
      )}

      {view === 'signup' && (
        <SignUpForm
          onSubmit={handleSignUp}
          onBack={() => setView('email')}
        />
      )}
    </div>
  </div>)
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
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
}