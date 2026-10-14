import type { CollectionConfig } from 'payload'
import { anyone, loggedIn } from '../lib/access'
import { revalidateAfterChange, revalidateAfterDelete } from '../lib/revalidate'
import { slugField } from '../fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Текстовые страницы' },
  admin: {
    group: 'Страницы сайта',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'inFooter'],
    description: 'Оферта, политика конфиденциальности и любые другие страницы с текстом.',
  },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { name: 'title', label: 'Заголовок', type: 'text', required: true },
    { name: 'content', label: 'Текст', type: 'richText' },
    slugField(),
    {
      name: 'inFooter',
      label: 'Ссылка в подвале сайта',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
