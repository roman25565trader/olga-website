import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/** Сайт статический: после любой правки в админке пересобираем страницы. */
const run = async () => {
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // вне Next.js (например, при заполнении базы скриптом) — пропускаем
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await run()
  return doc
}
export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await run()
  return doc
}
export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await run()
  return doc
}
