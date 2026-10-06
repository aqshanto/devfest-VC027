import { createContext, useCallback, useContext, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const Ctx = createContext(() => {})
const STYLE = {
  error: ['bg-rose-600', AlertTriangle],
  success: ['bg-emerald-600', CheckCircle2],
  info: ['bg-indigo-600', Info],
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const close = (id) => setItems((xs) => xs.filter((x) => x.id !== id))
  const push = useCallback((type, msg) => {
    const id = Math.random().toString(36).slice(2)
    setItems((xs) => [...xs.slice(-3), { id, type, msg }])
    setTimeout(() => close(id), type === 'error' ? 6000 : 3500)
  }, [])

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2" role="status" aria-live="polite">
        {items.map(({ id, type, msg }) => {
          const [bg, Icon] = STYLE[type] || STYLE.info
          return (
            <div key={id} className={`rise flex items-start gap-3 rounded-xl ${bg} p-3 text-sm text-white shadow-xl`}>
              <Icon className="mt-0.5 size-4 shrink-0" />
              <p className="flex-1">{msg}</p>
              <button onClick={() => close(id)} className="cursor-pointer opacity-70 hover:opacity-100" aria-label="close">
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
