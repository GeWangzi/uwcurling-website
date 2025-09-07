// app/test-events/page.tsx
'use client'

import { useEffect } from 'react'
import { GetEventList } from '@/lib/events'

export default function TestEventsPage() {
  useEffect(() => {
    const now = new Date()
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    async function logTest<T>(label: string, fn: () => Promise<T>) {
      try {
        const t0 = performance.now()
        const data: any[] = (await fn()) as any[]
        const t1 = performance.now()
        console.group(`%c${label}`, 'color:#ef4444')
        console.log(`Count: ${data.length}  (${Math.round(t1 - t0)}ms)`)
        console.table(
          data.slice(0, 5).map((e) => ({
            id: e.id,
            title: e.title,
            start: e.start,
            type: e.type,
            location: e.location,
          }))
        )
        console.groupEnd()
      } catch (err) {
        console.group(`%c${label}`, 'color:#ef4444')
        console.error('FAILED:', err)
        console.groupEnd()
      }
    }

    ;(async () => {
      console.log('%cRunning GetEventList tests…', 'color:#ef4444')

      await logTest('Default (no filters)', () => GetEventList())
      await logTest('Upcoming only', () => GetEventList(6, { upcomingOnly: true }))
      await logTest('Type = practice', () => GetEventList(6, { types: ['practice'] }))
      await logTest('Search: "learn"', () => GetEventList(6, { q: 'learn' }))
      await logTest('Location contains "Madison"', () => GetEventList(6, { location: 'Madison' }))
      await logTest('Next 30 days', () => GetEventList(12, { from: now, to: in30, sort: 'start_time' }))

      console.log('%cDone.', 'color:#22c55e')
    })()
  }, [])

  return (
    <div className="p-6 text-zinc-300">
      Open the browser console to see test output for <code>GetEventList</code>.
    </div>
  )
}
