import { useEffect, useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'


type Props = {
  email: string
  onVerify: (code: string) => void
  onResend: () => void
  onBack: () => void
  error: string | null
  loading: boolean
}

const RESEND_COOLDOWN = 30
const CODE_LENGTH = 6
export default function VerificationForm({ email, onVerify, onResend, onBack, error, loading }: Props
) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  function submit(newDigits: string[]) {
    const digits = newDigits.join('')
    if (code.length === CODE_LENGTH && !newDigits.includes('')) {
      onVerify(digits)
    }
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newDigits = [...code]
    newDigits[index] = digit
    setCode(newDigits)
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    submit(newDigits)
  }

  function handleKeydown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newDigits = [...code]
      if (code[index]) {
        newDigits[index] = ''
        setCode(newDigits)
      } else if (index > 0) {
        newDigits[index - 1] = ''
        setCode(newDigits)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    const newDigits = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((char, i) => { newDigits[i] = char })
    setCode(newDigits)

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
    submit(newDigits)
  }

  function handleResend() {
    setCooldown(RESEND_COOLDOWN)
    setCode(Array(CODE_LENGTH).fill(''))
    inputRefs.current[0]?.focus()
    onResend()
  }

  return (
    <div style={styles.form}>
      <p className="section-label"> Enter your code</p>
      <p style={styles.hint}>You've been emailed a code! Enter here to login:</p>
      <div style={styles.boxes}>
        {
          code.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeydown(index, e)}
              onPaste={handlePaste}
              onFocus={e => e.target.select()}
              style={
                {
                  ...styles.box,
                  ...(digit ? styles.boxFilled : {}),
                  ...(loading ? styles.boxDisabled : {}),
                }
              }
              disabled={loading}
            />
          ))
        }
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.actions}>
        {cooldown > 0 ? (
          <p style={styles.cooldown}>
            Resend code in {cooldown}s
          </p>
        ) : (
          <button className="secondary" onClick={handleResend}>
            Resend code
          </button>
        )}
        <button className="secondary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  hint: {
    fontSize: '0.85rem',
    color: 'var(--muted)',
    lineHeight: 1.5,
  },
  boxes: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-between',
  },
  box: {
    width: '100%',
    aspectRatio: '1',
    fontFamily: 'var(--font-display)',
    fontSize: '1.8rem',
    textAlign: 'center',
    background: 'var(--surface)',
    border: '2px solid var(--border)',
    color: 'var(--text)',
    outline: 'none',
    cursor: 'text',
    padding: '0',
    transition: 'border-color 0.15s',
  },
  boxFilled: {
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  boxDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  error: {
    color: 'var(--danger)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.06em',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cooldown: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'var(--muted)',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.08em',
  },
}