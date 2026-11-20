import styles from './Avatar.module.css'

interface AvatarProps {
  readonly initials: string
  readonly seed: number
  readonly size?: number
}

const hues = [styles.hue1, styles.hue2, styles.hue3, styles.hue4] as const

export function Avatar({ initials, seed, size = 32 }: AvatarProps) {
  const hue = hues[Math.abs(seed) % hues.length] ?? styles.hue1
  return (
    <span className={`${styles.avatar} ${hue}`} aria-hidden="true" style={{ '--avatar-size': `${size}px` } as React.CSSProperties}>
      {initials}
    </span>
  )
}
