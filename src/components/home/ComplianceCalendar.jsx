import { useState, useCallback, useEffect, useRef } from 'react'

// ── Compliance data ───────────────────────────────────────────
// monthly: applies every month on that day number
// specific: applies only in the listed months (0=Jan … 11=Dec)

const COMPLIANCE = [
  // Monthly recurring
  { day: 7,  label: 'TDS Remittance',                    months: 'all' },
  { day: 11, label: 'GSTR-1 Filing',                     months: 'all' },
  { day: 15, label: 'ECR Statement – Provident Fund',     months: 'all' },
  { day: 15, label: 'ECR Statement – ESI',                months: 'all' },
  { day: 20, label: 'GSTR-3B Filing',                     months: 'all' },
  { day: 20, label: 'Professional Tax Filing',             months: 'all' },

  // TDS Quarterly Return
  { day: 31, label: 'Q1 TDS Quarterly Return',            months: [6]  },  // July
  { day: 31, label: 'Q2 TDS Quarterly Return',            months: [9]  },  // October
  { day: 31, label: 'Q3 TDS Quarterly Return',            months: [0]  },  // January
  { day: 31, label: 'Q4 TDS Quarterly Return',            months: [4]  },  // May

  // Advance Tax Instalments
  { day: 15, label: 'Advance Tax – 1st Instalment',       months: [5]  },  // June
  { day: 15, label: 'Advance Tax – 2nd Instalment',       months: [8]  },  // September
  { day: 15, label: 'Advance Tax – 3rd Instalment',       months: [11] },  // December
  { day: 15, label: 'Advance Tax – 4th Instalment',       months: [2]  },  // March
]

// Build a map: day → [label, …] for a given year/month
function getEventsForMonth(year, month) {
  const map = {} // key = day number
  COMPLIANCE.forEach(({ day, label, months }) => {
    // Skip days that don't exist in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    if (day > daysInMonth) return
    // Check month filter
    if (months !== 'all' && !months.includes(month)) return
    if (!map[day]) map[day] = []
    map[day].push(label)
  })
  return map
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ── Tooltip component ─────────────────────────────────────────
function Tooltip({ events, date, onClose }) {
  const ref = useRef(null)

  // Close when clicking outside (mobile tap-away)
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      role="tooltip"
      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-brand-navy border border-brand-gold/40 rounded-xl shadow-2xl px-3 py-3 pointer-events-auto"
      style={{ minWidth: '14rem' }}
    >
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
        style={{ borderLeft:'6px solid transparent', borderRight:'6px solid transparent', borderTop:'6px solid #1a2e4a' }} />

      <p className="text-brand-gold text-xs font-bold mb-2">{date}</p>
      <ul className="space-y-1">
        {events.map((ev, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-200">
            <span className="text-brand-gold mt-0.5 flex-shrink-0">•</span>
            {ev}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Calendar cell ─────────────────────────────────────────────
function DayCell({ day, events, monthName }) {
  const [open, setOpen] = useState(false)
  const hasDue = events && events.length > 0
  const cellRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])

  // On desktop: show on mouseenter, hide on mouseleave
  // On touch: toggle on tap (Tooltip handles outside-tap dismiss)
  function handleMouseEnter() {
    if (!hasDue) return
    if (window.matchMedia('(hover: hover)').matches) setOpen(true)
  }
  function handleMouseLeave() {
    if (window.matchMedia('(hover: hover)').matches) setOpen(false)
  }
  function handleClick() {
    if (!hasDue) return
    if (!window.matchMedia('(hover: hover)').matches) setOpen(v => !v)
  }

  return (
    <div
      ref={cellRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative aspect-square flex flex-col items-center justify-center rounded-lg select-none
        ${hasDue
          ? 'bg-brand-gold cursor-pointer hover:bg-yellow-500 transition-colors'
          : 'bg-white/5'
        }`}
    >
      <span className={`text-xs sm:text-sm font-semibold leading-none ${hasDue ? 'text-brand-navy' : 'text-gray-300'}`}>
        {day}
      </span>

      {/* Dot indicator for multiple events */}
      {hasDue && events.length > 1 && (
        <span className="mt-0.5 flex gap-0.5">
          {events.slice(0, Math.min(events.length, 3)).map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full bg-brand-navy/60" />
          ))}
        </span>
      )}

      {open && (
        <Tooltip
          events={events}
          date={`${day} ${monthName}`}
          onClose={close}
        />
      )}
    </div>
  )
}

// ── Main calendar component ───────────────────────────────────
export default function ComplianceCalendar() {
  const today      = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const events       = getEventsForMonth(year, month)
  const firstDayOfWeek = new Date(year, month, 1).getDay()   // 0=Sun
  const daysInMonth   = new Date(year, month + 1, 0).getDate()

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Build grid: leading empty cells + day cells
  const cells = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <section className="py-16 md:py-20 bg-brand-navy">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-8">
          <span className="text-brand-gold text-xs font-semibold tracking-widest uppercase">Stay Ahead</span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-3">
            Compliance Calendar
          </h2>
          <p className="text-gray-400 text-sm mt-3 max-w-xl mx-auto">
            Key recurring deadlines highlighted in gold. Hover or tap a date to see what's due.
          </p>
        </div>

        {/* Calendar card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={prev}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="text-center">
              <p className="font-serif font-bold text-white text-lg leading-tight">
                {MONTH_NAMES[month]} {year}
              </p>
            </div>

            <button
              onClick={next}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Next month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2 gap-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) =>
              day === null ? (
                <div key={`empty-${i}`} className="aspect-square" />
              ) : (
                <DayCell
                  key={day}
                  day={day}
                  events={events[day] || null}
                  monthName={MONTH_NAMES[month]}
                />
              )
            )}
          </div>

          {/* Legend */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center">
            <span className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-4 h-4 rounded bg-brand-gold flex-shrink-0" />
              Due date — hover or tap for details
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-gray-500 text-xs mt-5">
          * Deadlines are indicative. Always verify with current official notifications for your specific taxpayer category.
        </p>
      </div>
    </section>
  )
}
