import type { CollectionConfig } from 'payload'
import { publishedOrLoggedIn, loggedIn } from '../lib/access'
import { revalidateAfterChange, revalidateAfterDelete } from '../lib/revalidate'

export const Flowers: CollectionConfig = {
  slug: 'flowers',
  labels: { singular: 'Цветок', plural: 'Цветы для конструктора' },
  defaultSort: 'sortOrder',
  admin: {
    group: 'Каталог',
    useAsTitle: 'name',
    defaultColumns: ['name', 'variety', 'price', 'stock', 'active'],
    description: 'Из этих цветов покупатель собирает свой букет. Цена — за 1 стебель/ветку.',
  },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Цветок', type: 'text', required: true },
        { name: 'variety', label: 'Сорт, цвет, длина', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'price', label: 'Цена за 1 шт, ₽', type: 'number', required: true, min: 0 },
        {
          name: 'unit',
          label: 'Единица',
          type: 'select',
          defaultValue: 'stem',
          options: [
            { label: 'стебель', value: 'stem' },
            { label: 'ветка', value: 'branch' },
            { label: 'шт', value: 'pcs' },
          ],
        },
        {
          name: 'stock',
          label: 'Наличие',
          type: 'select',
          defaultValue: 'in',
          options: [
            { label: 'В наличии', value: 'in' },
            { label: 'Мало', value: 'low' },
            { label: 'Закончился', value: 'out' },
          ],
        },
      ],
    },
    { name: 'image', label: 'Фото', type: 'upload', relationTo: 'media' },
    {
      name: 'active',
      label: 'Показывать в конструкторе',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      label: 'Порядок',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar' },
    },
  ],
}
