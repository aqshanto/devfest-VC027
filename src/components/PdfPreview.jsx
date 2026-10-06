import { useEffect, useMemo } from 'react'
import { Download, FileText, X } from 'lucide-react'
import { useT } from '../i18n.js'

export default function PdfPreview({ bytes, fileName, totalPages, onClose, onDownload }) {
  const { t } = useT()
  const url = useMemo(() => URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), [bytes])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        className="rise flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('preview')}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm font-semibold">{fileName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('generated', { n: totalPages })}</p>
          </div>
          <button className="btn-primary" onClick={onDownload}>
            <Download className="size-4" />
            <span className="hidden sm:inline">{t('download')}</span>
          </button>
          <button className="btn-ghost px-2.5" onClick={onClose} title={t('close')} aria-label={t('close')}>
            <X className="size-4" />
          </button>
        </div>
        <iframe src={url} title={fileName} className="w-full flex-1 bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  )
}
