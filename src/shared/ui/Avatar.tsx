import styles from './Avatar.module.css'

interface AvatarProps {
  readonly initials: string
  readonly seed: number
  readonly size?: number
}

const hues = [styles.hue1, styles.hue2, styles.hue3, styles.hue4] as const

export function Avatar({ initials, seed, size = 32 }: AvatarProps) {
  const className = [styles.avatar, hues[Math.abs(seed) % hues.length]].join(' ')
  return (
    <span className={className} aria-hidden="true" style={{ '--avatar-size': `${size}px` } as React.CSSProperties}>
      {initials}
    </span>
  )
}
