import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

export default function DropZone({ accept, multiple, onFiles, title, hint, compact }) {
  const input = useRef(null)
  const [over, setOver] = useState(false)
  const take = (list) => list?.length && onFiles([...list])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => input.current.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files) }}
      className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition ${
        compact ? 'p-4' : 'p-10'
      } ${
        over
          ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
          : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50/50 dark:border-slate-700 dark:hover:bg-violet-500/5'
      }`}
    >
      <span className={`grid place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 transition group-hover:scale-110 ${compact ? 'size-10' : 'size-14'}`}>
        <UploadCloud className={compact ? 'size-5' : 'size-7'} />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      <input
        ref={input}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => { take(e.target.files); e.target.value = '' }}
      />
    </div>
  )
}
