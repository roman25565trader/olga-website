/** Публичный адрес сайта: задаётся вручную или берётся у Vercel автоматически. */
export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
