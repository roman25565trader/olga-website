import type { CollectionConfig } from 'payload'
import { changesField } from '../fields/changes'
import { publishedOrLoggedIn, loggedIn } from '../lib/access'
import { revalidateAfterChange, revalidateAfterDelete } from '../lib/revalidate'
import { slugField } from '../fields/slug'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Букет', plural: '💐 Букеты и композиции' },
  defaultSort: 'sortOrder',
  admin: {
    group: 'Что продаём',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['images', 'title', 'price', 'active', 'featured'],
    description: 'Нажмите на букет, чтобы поменять фото, цену или описание. Галочка «В продаже» прячет или показывает его на сайте.',
    listSearchableFields: ['title'],
  },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  versions: { maxPerDoc: 20 },
  fields: [
    changesField,
    { name: 'title', label: 'Название', type: 'text', required: true },
    {
      name: 'images',
      label: 'Фото',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Первое фото — главное, его видно в каталоге. Перетаскивайте, чтобы поменять порядок. Лучше вертикальные.',
        components: { Cell: '@/components/admin/ThumbCell#ThumbCell' },
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'price', label: 'Цена, ₽', type: 'number', required: true, min: 0 },
        {
          name: 'oldPrice',
          label: 'Старая цена, ₽',
          type: 'number',
          min: 0,
          admin: { description: 'Если есть скидка — покажем зачёркнутой' },
        },
      ],
    },
    {
      name: 'short',
      label: 'Коротко под названием',
      type: 'text',
      admin: { description: 'Например: «15 роз 60 см · Ø 40 см»' },
    },
    { name: 'description', label: 'Описание', type: 'textarea' },
    { name: 'composition', label: 'Состав', type: 'textarea' },
    {
      name: 'sizes',
      label: 'Размеры (если есть)',
      type: 'array',
      labels: { singular: 'Размер', plural: 'Размеры' },
      admin: { description: 'Например S / M / L со своей ценой. Если пусто — одна цена.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Размер', type: 'text', required: true },
            { name: 'note', label: 'Пояснение', type: 'text' },
            { name: 'price', label: 'Цена, ₽', type: 'number', required: true, min: 0 },
          ],
        },
      ],
    },
    {
      name: 'categories',
      label: 'Разделы',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    slugField(),
    {
      name: 'active',
      label: 'В продаже',
      type: 'checkbox',
      defaultValue: true,
      admin: { components: { Cell: '@/components/admin/BoolCell#BoolCell' }, position: 'sidebar', description: 'Выключите — товар пропадёт с сайта' },
    },
    {
      name: 'featured',
      label: 'Показать на главной',
      type: 'checkbox',
      defaultValue: false,
      admin: { components: { Cell: '@/components/admin/BoolCell#BoolCell' }, position: 'sidebar' },
    },
    {
      name: 'badge',
      label: 'Метка на фото',
      type: 'text',
      admin: { position: 'sidebar', description: 'Например: «Хит», «Можно сегодня»' },
    },
    {
      name: 'sortOrder',
      label: 'Порядок',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Меньше — выше' },
    },
  ],
}
