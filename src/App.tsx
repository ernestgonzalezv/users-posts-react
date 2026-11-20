import { LocaleProvider } from './i18n/LocaleProvider'
import { AppBar } from './shared/ui/AppBar'

export function App() {
  return (
    <LocaleProvider>
      <AppBar />
      <main />
    </LocaleProvider>
  )
}
