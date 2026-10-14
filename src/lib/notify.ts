import type { Payload } from 'payload'

/** Уведомление в Telegram (бот и чат задаются в «Настройках сайта» или переменными окружения). */
export async function notifyTelegram(payload: Payload, text: string): Promise<void> {
  try {
    const settings = await payload.findGlobal({ slug: 'settings', overrideAccess: true, depth: 0 })
    const token = settings?.notify?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN
    const chatId = settings?.notify?.telegramChatId || process.env.TELEGRAM_CHAT_ID
    if (!token || !chatId) return
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    payload.logger.warn({ err }, 'Не удалось отправить уведомление в Telegram')
  }
}
