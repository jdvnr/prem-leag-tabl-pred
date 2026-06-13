import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import TeamItem from '../components/TeamItem'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMyPrediction } from '../hooks/useMyPrediction'
import { useSubmitPrediction } from '../hooks/useSubmitPrediction'
import { getToken, saveSession } from '../auth'

const TEAMS_2026_27 = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
  'Chelsea', 'Coventry City', 'Crystal Palace', 'Everton', 'Fulham',
  'Hull City', 'Ipswich Town', 'Leeds United', 'Liverpool', 'Man City',
  'Man Utd', 'Newcastle', 'Nottm Forest', 'Sunderland', 'Spurs',
]

export default function MyPredictionPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState<string[]>([])
  const sensors = useSensors(useSensor(PointerSensor))
  const [searchParams] = useSearchParams()
  const [modified, setModified] = useState<boolean>(false)

  const { loading, prediction, isLocked, error: loadError } = useMyPrediction()
  const { submit, saving, saved, error: saveError } = useSubmitPrediction()

  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      saveSession(urlToken)
      window.history.replaceState({}, '', '/predict/my')
    } else if (!getToken()) {
      navigate('/')
    }
  }, [])

  useEffect(() => {
    if (loading) return
    if (prediction) {
      setTeams(prediction)
    } else {
      setTeams(TEAMS_2026_27.sort())
    }
  }, [loading, prediction])


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    if (!modified) setModified(true)
    setTeams(prev => {
      const oldIndex = prev.indexOf(active.id as string)
      const newIndex = prev.indexOf(over.id as string)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  if (loading || teams.length == 0) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p style={styles.muted}>Loading...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <p style={styles.error}>{loadError}</p>
        </div>
      </div>
    )
  }
  const saveButtonStyle: React.CSSProperties = {
    width: 'auto',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    padding: '10px 20px',
    fontSize: '1rem',
    background: modified ? 'var(--accent)' : 'var(--muted)'
  }
  return (
    <>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <h1 style={styles.title}>Your Prediction</h1>
              <p style={styles.subtitle}>
                {isLocked ? 'Locked — good luck!' : 'Drag to reorder'}
              </p>
            </div>
            {!isLocked && (
              <button
                className="primary"
                style={saveButtonStyle}
                onClick={() => {
                  submit(teams)
                  setModified(false)
                }}
                disabled={!modified || saving}
              >
                {modified ?
                  saving ?
                    'Saving...' :
                    saved ?
                      'Saved ✓' :
                      'Save'
                  : 'Save'}
              </button>
            )}
          </div>
          <div className="stripe" />
          <div style={styles.body}>
            {saveError && <p style={styles.error}>{saveError}</p>}
            <p className="section-label">
              {isLocked ? 'Final Prediction' : '2026-27 Premier League'}
            </p>
            {isLocked ? (
              <div style={styles.list}>
                {teams.map((team, index) => (
                  <div key={team} style={styles.lockedRow}>
                    <TeamItem key={team} id={team} position={index + 1} name={team} />
                  </div>
                ))}
              </div>) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={teams} strategy={verticalListSortingStrategy}>
                  <div style={styles.list}>
                    {teams.map((team, index) => (
                      <TeamItem key={team} id={team} position={index + 1} name={team} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext >
            )
            }
          </div>

          <div style={styles.footer}>
            <button className="secondary" style={styles.backButton} onClick={() => navigate('/predict')}>
              Go back
            </button>
          </div>
          <div style={styles.footer}>
            <span style={styles.footerText}>That's Offside!</span>
            <span style={styles.footerText}>2026–27 Season</span>
          </div>
        </div >
      </div >
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 24px',
  },
  container: {
    background: 'var(--surface)',
    border: '2px solid var(--border)',
    width: '100%',
    maxWidth: '560px',
    overflow: 'hidden',
  },
  header: {
    background: 'var(--border)',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    color: 'var(--surface)',
    letterSpacing: '0.04em',
    lineHeight: 1,
  },
  subtitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.7rem',
    color: '#7B8A96',
    letterSpacing: '0.12em',
  },
  saveButton: {
    width: 'auto',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    padding: '10px 20px',
    fontSize: '1rem',
  },
  body: {
    padding: '24px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  lockedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    background: 'var(--bg)',
    border: '1.5px solid var(--border)',
    borderLeft: '4px solid var(--muted)',
    opacity: 0.7,
  },
  position: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.1rem',
    color: 'var(--muted)',
    width: '24px',
    textAlign: 'center' as const,
    flexShrink: 0,
  },
  name: {
    flex: 1,
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--muted)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  },
  error: {
    color: 'var(--danger)',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.06em',
    marginBottom: '16px',
  },
  muted: {
    color: 'var(--muted)',
    fontSize: '0.875rem',
    padding: '24px 0',
    textAlign: 'center' as const,
  },
  footer: {
    background: 'var(--border)',
    padding: '6px 24px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.65rem',
    color: '#4A5568',
    letterSpacing: '0.12em',
  },
  backButton: {
    color: '#9ba8c4',
  }
}