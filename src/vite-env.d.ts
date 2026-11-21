interface ImportMetaEnv {
  readonly VITE_API_DELAY_MS?: string
  readonly VITE_API_FAIL_FIRST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
