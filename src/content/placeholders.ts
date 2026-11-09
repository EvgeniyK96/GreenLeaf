const PH_RE = /\{\{[A-Z0-9_]+\}\}/

/** true, если значение ещё не заполнено (содержит {{KEY}}). */
export function isPlaceholder(value: string | null | undefined): boolean {
  return value == null || value === '' || PH_RE.test(value)
}

export function isFilled(value: string | null | undefined): value is string {
  return !isPlaceholder(value)
}

/** Показывать ли сырые ключи {{...}} (dev всегда, prod — только с VITE_SHOW_PLACEHOLDERS=true). */
export const SHOW_PLACEHOLDERS =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_PLACEHOLDERS === 'true'
