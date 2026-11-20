import { LocaleProvider } from './i18n/LocaleProvider'
import { AppBar } from './shared/ui/AppBar'
import { ThemeProvider } from './theme/ThemeProvider'

export function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AppBar />
        <main />
      </LocaleProvider>
    </ThemeProvider>
  )
}
