import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import EmailForm from '../components/EmailForm'
import SignUpForm from '../components/SignUpForm'
// import { saveSession } from '../auth'

type View = 'email' | 'signup' | 'confirmation'
export default function WelcomePage() {
  const [view, setView] = useState<View>('email')
  // const navigate = useNavigate()

  async function handleEmailContinue(email: string) {
    try {
      await fetch('/api/send-login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      setView('confirmation')
    } catch (err) {
      console.error('Login failed: ', err)
    }

  }

  async function handleSignUp(firstName: string, lastName: string, email: string) {
    // Later: call upsert_user, get token, send email
    try {
      await fetch('/api/send-signup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName })
      })
      setView('confirmation')
    } catch (err) {
      console.error('Sign up failed: ', err)
    }

  }
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.hero}>
          <div style={styles.seasonBadge}>2026-27 Season</div>
          <h1 style={styles.title}>
            That's<br />
            <span style={styles.titleAccent}>Offside!</span>
          </h1>
          <p style={styles.heroSub}>League Predictor, and more!</p>
        </div>
        <div className="stripe" />
        <div style={styles.body}>
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

          {view === 'confirmation' && (
            <div style={styles.header}>
              <p style={styles.confirmation}>
                <p style={styles.confirmTitle}> Check your email</p>
                <p style={styles.confirmSub}>
                  We've sent you a login email. Feel free to close this tab.
                </p>
              </p>
            </div>
          )}
        </div>
        <div style={styles.footer}>
          <span style={styles.footerText}>That's Offside!</span>
          <span style={styles.footerText}>Free to play</span>
        </div>
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
    border: '2px solid var(--border)',
    width: '100%',
    maxWidth: '400px',
    overflow: 'hidden',
  },
  hero: {
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
    fontSize: '3.8rem',
    color: 'var(--surface)',
    lineHeight: 0.9,
    letterSpacing: '0.02em',
  },
  titleAccent: {
    color: 'var(--highlight)',
  },
  heroSub: {
    color: '#7B8A96',
    fontSize: '0.7rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginTop: '10px',
    fontFamily: 'var(--font-display)',
  },
  body: {
    padding: '28px',
  },
  confirmation: {
    textAlign: 'center',
    padding: '12px 0',
  },
  confirmTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.8rem',
    letterSpacing: '0.05em',
    color: 'var(--accent)',
    marginBottom: '10px',
  },
  confirmSub: {
    color: 'var(--muted)',
    fontSize: '0.875rem',
    lineHeight: 1.6,
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