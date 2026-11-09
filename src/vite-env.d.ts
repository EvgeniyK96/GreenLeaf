/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL приёма заявок, например /api/lead. Без него форма предлагает написать напрямую. */
  readonly VITE_FORM_ENDPOINT?: string
  /** 'true' — показывать {{ключи}} плейсхолдеров и в продакшен-сборке (для показа клиенту). */
  readonly VITE_SHOW_PLACEHOLDERS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
