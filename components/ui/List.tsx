import React from 'react'

interface ListProps {
  children: React.ReactNode
}

export function List({ children }: ListProps) {
  const arr = React.Children.toArray(children)
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)',
        overflow: 'hidden',
      }}
    >
      {arr.map((c, i) => (
        <div
          key={i}
          style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none' }}
        >
          {c}
        </div>
      ))}
    </div>
  )
}
