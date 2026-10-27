import type { GlobalConfig } from 'payload'
import { loggedInField } from '../lib/access'
import { revalidateGlobal } from '../lib/revalidate'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: '📞 Телефон и контакты',
  admin: { group: 'Настройки', hideAPIURL: true },
  access: { read: () => true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Магазин',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'siteName', label: 'Название (логотип)', type: 'text', required: true, defaultValue: 'Клумба' },
                { name: 'tagline', label: 'Подпись под логотипом', type: 'text', defaultValue: 'цветочный салон' },
              ],
            },
            { name: 'logo', label: 'Логотип-картинка (необязательно)', type: 'upload', relationTo: 'media' },
            { name: 'city', label: 'Город', type: 'text', defaultValue: 'Магнитогорск' },
            {
              name: 'topBar',
              label: 'Строка над шапкой',
              type: 'array',
              labels: { singular: 'Фраза', plural: 'Фразы' },
              maxRows: 4,
              fields: [{ name: 'text', label: 'Текст', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Контакты',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', label: 'Телефон', type: 'text', defaultValue: '8 (982) 322-84-85' },
                { name: 'whatsapp', label: 'WhatsApp (номер)', type: 'text', admin: { description: 'Например 79823228485' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'instagram', label: 'Instagram (ссылка)', type: 'text' },
                { name: 'telegram', label: 'Telegram (ссылка)', type: 'text' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'vk', label: 'ВКонтакте (ссылка)', type: 'text' },
                { name: 'max', label: 'MAX (ссылка)', type: 'text' },
              ],
            },
            { name: 'instagramNote', label: 'Подпись к Instagram', type: 'text', defaultValue: 'Посмотрите наши работы' },
            { name: 'address', label: 'Адрес', type: 'text', defaultValue: 'пр. Карла Маркса, 121' },
            { name: 'mapLink', label: 'Ссылка на карту (2ГИС / Яндекс)', type: 'text' },
            { name: 'hours', label: 'Часы работы', type: 'text', defaultValue: 'Ежедневно 10:00–21:00' },
          ],
        },
        {
          label: 'Чат и уведомления',
          fields: [
            { name: 'chatEnabled', label: 'Показывать «Чат с флористом»', type: 'checkbox', defaultValue: true },
            {
              name: 'chatGreeting',
              label: 'Приветствие в чате',
              type: 'textarea',
              defaultValue:
                'Здравствуйте! Я Ольга, флорист. Напишите, какой букет хотите, — повод, бюджет, любимые цвета. Отвечу в течение 15 минут.',
            },
            {
              name: 'notify',
              label: 'Уведомления в Telegram о заказах и сообщениях',
              type: 'group',
              access: { read: loggedInField },
              admin: {
                description:
                  'Создайте бота у @BotFather, вставьте токен; chat id можно узнать у @userinfobot. Можно оставить пустым.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'telegramBotToken', label: 'Токен бота', type: 'text' },
                    { name: 'telegramChatId', label: 'Chat ID', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Поисковики и подвал',
          fields: [
            { name: 'seoTitle', label: 'Заголовок сайта для Яндекса/Google', type: 'text' },
            { name: 'seoDescription', label: 'Описание сайта для Яндекса/Google', type: 'textarea' },
            { name: 'ogImage', label: 'Картинка для ссылок в мессенджерах', type: 'upload', relationTo: 'media' },
            { name: 'yandexMetrika', label: 'Номер счётчика Яндекс.Метрики', type: 'text' },
            { name: 'legal', label: 'Реквизиты в подвале', type: 'text', defaultValue: 'ИП [ФИО] · ИНН [—]' },
            { name: 'seededAt', type: 'date', admin: { hidden: true } },
          ],
        },
      ],
    },
  ],
}
