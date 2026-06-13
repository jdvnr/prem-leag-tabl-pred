import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from './Icons'
import type { IconName } from '../assets/icons'

type Props = {
  id: string
  position: number
  name: string
}

export default function TeamItem({ id, position, name }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const outerStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : 'auto',
    width: '100%',
  }
  const isChampion = position === 1
  const isCL = position >= 2 && position <= 4
  const isRel = position >= 18
  const icon_name = name.toLowerCase().split(' ').join('_') as IconName

  const accentColor = () => {
    if (isChampion) return '#C9A84C'
    if (isCL) return '#3B82F6'
    if (isRel) return '#F97316'
    return 'var(--border)'
  }

  function getBackground() {
    if (isDragging) return 'var(--bg)'
    if (isChampion) return '#FFFAED'
    if (isCL) return '#EFF6FF'
    if (isRel) return '#FFF4ED'
    return 'var(--surface)'
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '14px',
    padding: '12px 16px',
    background: getBackground(),
    border: `1.5px solid var(--border)`,
    borderLeft: `4px solid ${accentColor}`,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    boxSizing: 'border-box',
  }

  const posStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: isChampion ? '1.3rem' : '1.1rem',
    color: accentColor(),
    width: '24px',
    flexShrink: 0,
    textAlign: 'center',
  }

  const nameStyle: React.CSSProperties = {
    flex: 1,
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const handleStyle: React.CSSProperties = {
    color: 'var(--muted)',
    fontSize: '1rem',
    flexShrink: 0,
  }

  const crownStyle: React.CSSProperties = {
    color: '#C9A84C',
    fontSize: '0.9rem',
    flexShrink: 0,
  }
  return (
    <div ref={setNodeRef} style={outerStyle} {...attributes} {...listeners}>
      {/* <div style={rowStyle}> */}
      <div style={rowStyle}><span style={posStyle}>{position}</span>
        <Icon name={icon_name} />
        <span style={nameStyle}>{name}</span>
        {isChampion && <span style={crownStyle}>♛</span>}
        <span style={handleStyle}>⠿</span></div>
    </div>
  )
}