import { useT } from '../../../i18n/locale-context'
import { Avatar } from '../../../shared/ui/Avatar'
import { BriefcaseIcon, LinkIcon, MailIcon } from '../../../shared/ui/icons'
import type { User } from '../domain/model/user'
import { initialsOf } from '../domain/model/user'
import styles from './UserHeader.module.css'

interface UserHeaderProps {
  readonly user: User
}

export function UserHeader({ user }: UserHeaderProps) {
  const t = useT()
  return (
    <header className={styles.header}>
      <Avatar initials={initialsOf(user.name)} seed={user.id} size={48} />
      <div>
        <h2 className={styles.name}>{user.name}</h2>
        <ul className={styles.chips}>
          <li className={styles.chip}>
            <MailIcon />
            <span>{user.email}</span>
          </li>
          {user.website !== '' && (
            <li className={styles.chip}>
              <LinkIcon />
              <span>{user.website}</span>
            </li>
          )}
          {user.company !== '' && (
            <li className={styles.chip}>
              <BriefcaseIcon />
              <span>{t('user.company', { company: user.company })}</span>
            </li>
          )}
        </ul>
      </div>
    </header>
  )
}
