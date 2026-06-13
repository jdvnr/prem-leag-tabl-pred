import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import EmailForm from '../components/EmailForm'
import SignUpForm from '../components/SignUpForm'
import { useNavigate } from 'react-router-dom'
import { saveSession } from '../auth'
import VerificationForm from '../components/VerificationForm'
// import { saveSession } from '../auth'

type View = 'email' | 'signup' | 'verification'
export default function WelcomePage() {
  const [view, setView] = useState<View>('email')
  const [email, setEmail] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const navigate = useNavigate()

  async function handleEmailContinue(email: string) {
    try {
      const res = await fetch('/api/send-login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.status === 429) {
        return
      }
      setView('verification')
    } catch (err) {
      console.error('Login failed: ', err)
    }

  }

  async function handleSignUp(firstName: string, lastName: string, email: string) {
    // Later: call upsert_user, get token, send email
    try {
      const res = await fetch('/api/send-signup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName })
      })
      if (res.status === 429) return
      setView('verification')
    } catch (err) {
      console.error('Sign up failed: ', err)
    }
  }

  async function handleVerifyCode(code: string) {
    setVerifying(true)
    setCodeError(null)

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()

      if (!res.ok) {
        setCodeError(data.error ?? 'Invalid or expired code')
        setVerifying(false)
        return
      }
      saveSession(data.token)
      navigate('/predict')
    } catch (err) {
      setCodeError('Something went wrong. Try again ' + err)
      setVerifying(false)
    }
  }

  async function handleResend() {
    try {
      await fetch('/api/send-login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
    } catch (err) {
      console.error('Resend failed: ', err)
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
          {view === 'verification' && (
            <VerificationForm
              email={email}
              onVerify={handleVerifyCode}
              onResend={handleResend}
              onBack={() => setView('email')}
              error={codeError}
              loading={verifying}
            />
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