import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/url'

// Поисковики и ИИ-помощники (ChatGPT, Claude, Perplexity, Алиса/YandexGPT, Gemini…): каталог открыт всем
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'YandexAdditional',
  'YandexAdditionalBot',
  'Bingbot',
  'DuckAssistBot',
  'meta-externalagent',
  'cohere-ai',
  'MistralAI-User',
]

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  const disallow = ['/admin', '/api', '/shop-api', '/korzina']
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: AI_BOTS, allow: ['/', '/llms.txt', '/llms-full.txt'], disallow },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
