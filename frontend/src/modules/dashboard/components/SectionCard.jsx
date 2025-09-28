export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  footer,
  className = "",
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col ${className}`}
    >
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-slate-700 leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-4 pb-4 flex-1 min-h-[60px]">{children}</div>
      {footer && (
        <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500 bg-slate-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}
