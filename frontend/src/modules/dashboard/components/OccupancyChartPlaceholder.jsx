import SectionCard from "./SectionCard";

// value: número de 0 a 100 (promedio de ocupación)
// loading: boolean para mostrar estado de carga
export function OccupancyChartPlaceholder({ value = 0, loading = false }) {
  const display = typeof value === 'number' && !isNaN(value) ? Math.max(0, Math.min(100, value)) : 0;
  // Dinámica de color por umbral
  let ringColor = 'text-emerald-500'; // <50
  if (display >= 50 && display < 80) ringColor = 'text-amber-500';
  if (display >= 80) ringColor = 'text-rose-500';

  // SVG circle math
  const size = 160; // px
  const stroke = 10;
  const radius = (size / 2) - stroke;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (display / 100) * circumference;

  return (
    <SectionCard
      title="Ocupación Áreas Comunes"
      subtitle="Uso relativo"
      className="h-full"
    >
      <div className="h-60 w-full flex items-center justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Base track */}
            <svg width={size} height={size} className="block rotate-[-90deg]"> 
              <circle
                cx={size/2}
                cy={size/2}
                r={radius}
                strokeWidth={stroke}
                className="stroke-slate-200 fill-none"
              />
              {/* Progress */}
              <circle
                cx={size/2}
                cy={size/2}
                r={radius}
                strokeWidth={stroke}
                strokeLinecap="round"
                className={`fill-none ${ringColor} transition-[stroke-dashoffset] duration-700 ease-out`}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: loading ? circumference : offset,
                }}
              />
            </svg>
          {/* Centro */}
          <div className="absolute inset-[24%] rounded-full bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-center px-2 border border-white/60 shadow-sm" aria-label={`Ocupación promedio ${display}%`} title={`Ocupación promedio ${display}%`}>
            {loading ? (
              <span className="h-4 w-10 rounded bg-slate-200 animate-pulse" />
            ) : (
              <>
                <span className="text-xl font-semibold text-slate-700">{display}%</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">Promedio</span>
              </>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-slate-500 text-center">
        Placeholder: se actualizará con datos reales
      </p>
    </SectionCard>
  );
}
