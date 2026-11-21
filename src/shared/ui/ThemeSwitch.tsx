import { useT } from '../../i18n/locale-context'
import { useTheme } from '../../theme/theme-context'
import type { ThemeChoice } from '../../theme/theme'
import { MonitorIcon, MoonIcon, SunIcon } from './icons'
import type { SegmentedOption } from './SegmentedControl'
import { SegmentedControl } from './SegmentedControl'

export function ThemeSwitch() {
  const t = useT()
  const { choice, setChoice } = useTheme()
  const options: readonly SegmentedOption<ThemeChoice>[] = [
    { value: 'light', title: t('theme.light'), label: <SunIcon /> },
    { value: 'dark', title: t('theme.dark'), label: <MoonIcon /> },
    { value: 'system', title: t('theme.system'), label: <MonitorIcon /> },
  ]
  return <SegmentedControl label={t('theme.label')} value={choice} options={options} onChange={setChoice} />
}
