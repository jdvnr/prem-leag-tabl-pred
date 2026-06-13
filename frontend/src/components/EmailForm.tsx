import { useState } from 'react'


type Props = {
  onContinue: (email: string) => void,
  onSignUp: () => void

}

export default function EmailForm({
  onContinue,
  onSignUp
}: Props
) {
  const [email, setEmail] = useState('')
  function handleSubmit() {
    if (!email.trim())
      return
    onContinue(email.trim())
  }
  return (
    <>
      <div style={styles.form}>
        <p style={styles.label}>Enter your email to get back to it</p>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <div style={styles.actions}>
          <button className="primary" onClick={handleSubmit}>
            Continue
          </button>
          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>New here?</span>
            <span style={styles.dividerLine} />
          </div>
          <button className="secondary" onClick={onSignUp}>
            Create account
          </button>
        </div>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '4px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--border)',
    opacity: 0.3,
    display: 'block',
  },
  dividerText: {
    fontSize: '0.7rem',
    color: 'var(--muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-display)',
  },
}