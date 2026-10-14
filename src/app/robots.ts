import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/url'

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/shop-api', '/korzina'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
