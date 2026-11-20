import { useT } from '../../i18n/locale-context'
import { useTheme } from '../../theme/theme-context'
import type { Theme } from '../../theme/theme'
import { MoonIcon, SunIcon } from './icons'
import type { SegmentedOption } from './SegmentedControl'
import { SegmentedControl } from './SegmentedControl'

export function ThemeSwitch() {
  const t = useT()
  const { theme, setTheme } = useTheme()
  const options: readonly SegmentedOption<Theme>[] = [
    { value: 'light', title: t('theme.light'), label: <SunIcon /> },
    { value: 'dark', title: t('theme.dark'), label: <MoonIcon /> },
  ]
  return <SegmentedControl label={t('theme.label')} value={theme} options={options} onChange={setTheme} />
}
