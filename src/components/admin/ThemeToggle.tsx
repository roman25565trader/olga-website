'use client'
import { useTheme } from '@payloadcms/ui'

/** Кнопка «светлая / тёмная тема» в шапке админки */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className="oc-theme"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      title={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
    >
      <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
      <span className="oc-theme-t">{dark ? 'Светлая тема' : 'Тёмная тема'}</span>
    </button>
  )
}
