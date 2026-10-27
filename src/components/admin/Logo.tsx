import config from '@payload-config'
import { getPayload } from 'payload'

/** Логотип на странице входа в админку — название берётся из «Телефон и контакты» */
export async function Logo() {
  let name = 'Клумба'
  try {
    const payload = await getPayload({ config })
    const s = await payload.findGlobal({ slug: 'settings', depth: 0 })
    if (s.siteName) name = s.siteName
  } catch {}
  return (
    <div className="oc-logo">
      <span className="oc-logo-n">{name}</span>
      <span className="oc-logo-s">управление сайтом</span>
    </div>
  )
}

/** Маленький значок слева вверху */
export function Icon() {
  return <span className="oc-icon">🌷</span>
}
