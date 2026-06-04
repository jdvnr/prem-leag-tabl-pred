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
import { getToken, saveSession } from '../auth'

const TEAMS_2026_27 = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
  'Chelsea', 'Coventry City', 'Crystal Palace', 'Everton', 'Fulham',
  'Hull City', 'Ipswich Town', 'Leeds United', 'Liverpool', 'Man City',
  'Man Utd', 'Newcastle', 'Nottm Forest', 'Sunderland', 'Spurs',
]

export default function MyPredictionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  useEffect(() => {
    const urlToken = searchParams.get('token')

    if (urlToken) {
      saveSession(urlToken)
      window.history.replaceState({}, '', '/predict/my')
    } else if (!getToken()) {
      navigate('/')
    }
  }, [])

  const [teams, setTeams] = useState<string[]>([...TEAMS_2026_27].sort())
  const sensors = useSensors(useSensor(PointerSensor))
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setTeams(prev => {
      const oldIndex = prev.indexOf(active.id as string)
      const newIndex = prev.indexOf(over.id as string)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  function handleSave() {
    // Later: call submit_prediction with teams array and token
    console.log('Saving prediction:', teams)
  }
  return (
    <>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>League Predictor</h1>
              <p style={styles.subtitle}>Drag to make your predictions for Premier League 2026/27</p>
            </div>
            <button className="primary" style={styles.saveButton} onClick={handleSave}>
              Save prediction
            </button>
          </div>

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
          </DndContext>
          <div style={styles.footer}>
            <button className="secondary" style={styles.backButton} onClick={() => navigate('/predict')}>
              Go back
            </button>
          </div>
        </div>
      </div>
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
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '16px'
  },
  backButton: {
    width: 'auto',
  }
}