'use client'
import { useSyncExternalStore } from 'react'

export type BuilderLine = { id: number; name: string; qty: number; price: number }
export type CartItem =
  | { key: string; kind: 'product'; id: number; slug: string; title: string; variant?: string; price: number; qty: number; image?: string }
  | { key: string; kind: 'builder'; title: string; lines: BuilderLine[]; packaging?: string; price: number; qty: number; image?: string }

const KEY = 'cart-v1'
let items: CartItem[] = []
let loaded = false
const listeners = new Set<() => void>()

const load = () => {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    items = JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    items = []
  }
}
const emit = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {}
  listeners.forEach((l) => l())
}

export const cart = {
  get: () => {
    load()
    return items
  },
  add(item: CartItem) {
    load()
    const same = items.find((i) => i.key === item.key)
    items = same ? items.map((i) => (i.key === item.key ? { ...i, qty: i.qty + item.qty } : i)) : [...items, item]
    emit()
    window.dispatchEvent(new CustomEvent('cart:added', { detail: item.title }))
  },
  setQty(key: string, qty: number) {
    items = qty <= 0 ? items.filter((i) => i.key !== key) : items.map((i) => (i.key === key ? { ...i, qty } : i))
    emit()
  },
  remove(key: string) {
    items = items.filter((i) => i.key !== key)
    emit()
  },
  clear() {
    items = []
    emit()
  },
  subscribe(l: () => void) {
    listeners.add(l)
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        loaded = false
        load()
        l()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(l)
      window.removeEventListener('storage', onStorage)
    }
  },
}

const EMPTY: CartItem[] = []
export const useCart = () => useSyncExternalStore(cart.subscribe, cart.get, () => EMPTY)
export const cartTotal = (list: CartItem[]) => list.reduce((s, i) => s + i.price * i.qty, 0)
export const cartCount = (list: CartItem[]) => list.reduce((s, i) => s + i.qty, 0)
