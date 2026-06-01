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
          <button className="secondary" onClick={onSignUp}>
            Sign up
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
    gap: '16px',
  },
  label: {
    color: 'var(--muted)',
    fontSize: '0.9rem',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
}