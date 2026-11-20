import { useLocale } from '../../i18n/locale-context'
import type { Locale } from '../../i18n/locale'
import { GlobeIcon } from './icons'
import type { SegmentedOption } from './SegmentedControl'
import { SegmentedControl } from './SegmentedControl'

export function LanguageSwitch() {
  const { locale, setLocale, t } = useLocale()
  const options: readonly SegmentedOption<Locale>[] = [
    {
      value: 'en',
      title: t('language.en'),
      label: (
        <>
          <GlobeIcon />
          {t('language.en.short')}
        </>
      ),
    },
    { value: 'es', title: t('language.es'), label: t('language.es.short') },
  ]
  return <SegmentedControl label={t('language.label')} value={locale} options={options} onChange={setLocale} />
}
