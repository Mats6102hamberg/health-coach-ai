/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_GOOGLE_AI_API_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_VAPID_PUBLIC_KEY: string
  readonly VITE_VAPID_PRIVATE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
