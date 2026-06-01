import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Props = {
  id: string
  position: number
  name: string
}

export default function TeamItem({ id, position, name, icon }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : 'auto',
    position: 'relative',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={isDragging ? { ...itemStyles.row, ...itemStyles.rowDragging } : itemStyles.row}>
        <span style={itemStyles.position}>{position}</span>
        <span style={itemStyles.name}>{name}</span>
        <span style={itemStyles.handle}>⠿</span>
      </div>
    </div>
  )
}

const itemStyles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 20px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    cursor: 'grab',
    userSelect: 'none',
    transition: 'border-color 0.15s, background 0.15s',
  },
  rowDragging: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-dim)',
    cursor: 'grabbing',
  },
  position: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    color: 'var(--accent)',
    width: '28px',
    textAlign: 'center',
    flexShrink: 0,
  },
  name: {
    flex: 1,
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  handle: {
    color: 'var(--muted)',
    fontSize: '1.2rem',
  },
}