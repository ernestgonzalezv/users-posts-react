import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { useTheme } from '../../theme/theme-context'
import { useRoute } from './use-route'

function Probe() {
  const { route } = useRoute()
  const { theme } = useTheme()
  return <p>{`${route.kind}/${theme}`}</p>
}

describe('server snapshots', () => {
  it('render the home route and the light theme on the server', () => {
    const html = renderToString(
      <ThemeProvider initialChoice="system">
        <Probe />
      </ThemeProvider>,
    )
    expect(html).toContain('home/light')
  })
})
