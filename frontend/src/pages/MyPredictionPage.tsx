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

  return (
    <>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>League Predictor</h1>
              <p style={styles.subtitle}>
                {isLocked ? 'Your predictions are locked - good luck!' : 'Drag to make your predictions for Premier League 2026/27'}
              </p>
            </div>

            {!isLocked && (
              <button className="primary" style={styles.saveButton} onClick={() => submit(teams)} disabled={saving}>
                {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save prediction'}
              </button>
            )}
          </div>
          {saveError && <p style={styles.error}>{saveError}</p>}
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

          <div style={styles.footer}>
            <button className="secondary" style={styles.backButton} onClick={() => navigate('/predict')}>
              Go back
            </button>
          </div>
        </div >
      </div >
    </>
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
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px',
    gap: '16px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.5rem',
    letterSpacing: '0.05em',
    color: 'var(--accent)',
    lineHeight: 1,
  },
  subtitle: {
    color: 'var(--muted)',
    fontSize: '0.9rem',
    marginTop: '6px',
  },
  saveButton: {
    width: 'auto',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  lockedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 20px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
  },
  position: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    color: 'var(--muted)',
    width: '28px',
    textAlign: 'center',
    flexShrink: 0,
  },
  name: {
    flex: 1,
    fontWeight: 500,
    fontSize: '0.95rem',
    color: 'var(--muted)',
  },
  muted: {
    color: 'var(--muted)',
    fontSize: '0.95rem',
  },
  error: {
    color: 'var(--danger)',
    fontSize: '0.9rem',
    marginBottom: '16px',
  },
}