import type { Field } from 'payload'

/** Блок «Вы поменяли: было → станет» вверху формы */
export const changesField: Field = {
  name: 'changesPanel',
  type: 'ui',
  admin: { components: { Field: '@/components/admin/ChangesPanel#ChangesPanel' } },
}
