import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Chats } from './collections/Chats'
import { Flowers } from './collections/Flowers'
import { Media } from './collections/Media'
import { Orders } from './collections/Orders'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { About } from './globals/About'
import { Builder } from './globals/Builder'
import { Delivery } from './globals/Delivery'
import { Home } from './globals/Home'
import { Settings } from './globals/Settings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const blobToken = process.env.BLOB_READ_WRITE_TOKEN
const smtp = process.env.SMTP_HOST

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — админка' },
    dateFormat: 'dd.MM.yyyy HH:mm',
    components: {
      beforeDashboard: ['@/components/admin/Welcome#Welcome'],
    },
  },
  i18n: { supportedLanguages: { ru }, fallbackLanguage: 'ru' },
  collections: [Orders, Chats, Products, Categories, Flowers, Media, Pages, Users],
  globals: [Home, Builder, Delivery, About, Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
      max: process.env.VERCEL ? 3 : 10,
    },
    prodMigrations: migrations,
    push: false,
  }),
  email: smtp
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER || '',
        defaultFromName: 'Сайт цветочного магазина',
        transportOptions: {
          host: smtp,
          port: Number(process.env.SMTP_PORT || 465),
          secure: Number(process.env.SMTP_PORT || 465) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        },
      })
    : undefined,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      collections: { media: { disablePayloadAccessControl: true } },
      token: blobToken || '',
      clientUploads: true,
    }),
  ],
  onInit: async (payload) => {
    // Первый вход: создаём администратора из переменных окружения
    const email = process.env.ADMIN_EMAIL || 'rura.alla@bk.ru'
    const password = process.env.ADMIN_PASSWORD
    if (!password) return
    const { totalDocs } = await payload.count({ collection: 'users' })
    if (totalDocs === 0) {
      await payload.create({ collection: 'users', data: { email, password, name: 'Ольга' } })
      payload.logger.info(`Создан администратор ${email}`)
    }
  },
})
