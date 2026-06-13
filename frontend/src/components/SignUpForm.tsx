import { useState } from 'react'


type Props = {
  onSubmit: (
    firstName: string,
    lastName: string,
    email: string
  ) => void,
  onBack: () => void
}

export default function SignUpForm({
  onSubmit,
  onBack
}: Props
) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  function handleSubmit() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return
    onSubmit(firstName.trim(), lastName.trim(), email.trim())
  }
  return (
    <>
      <div style={styles.form}>
        <p className="section-label">Create your account</p>
        <div style={styles.nameRow}>
          <input
            type="text"
            placeholder="Bruno"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            autoFocus
          />
          <input
            type="text"
            placeholder="Fernandes"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </div>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div style={styles.actions}>
          <button className="primary" onClick={handleSubmit}>
            Let's go!
          </button>
          <button className="secondary" onClick={onBack}>
            Back
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
    gap: '10px',
  },
  nameRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '4px',
  },
}