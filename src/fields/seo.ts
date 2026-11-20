import type { Field } from 'payload'

/** Заголовок и описание для Яндекса/Google. Пусто — сайт составит сам из названия и описания. */
export const seoGroup: Field = {
  name: 'seo',
  label: 'Для Яндекса и Google',
  type: 'group',
  admin: {
    description: 'Можно не заполнять — сайт сам составит заголовок и описание из названия, состава и города.',
  },
  fields: [
    {
      name: 'title',
      label: 'Заголовок в поиске',
      type: 'text',
      admin: { description: 'До 65 знаков. Название магазина добавится само.' },
    },
    {
      name: 'description',
      label: 'Описание в поиске',
      type: 'textarea',
      admin: { description: '140–160 знаков: что это, для кого, доставка по городу.' },
    },
  ],
}
