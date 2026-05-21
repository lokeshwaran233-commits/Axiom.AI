import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  icon: React.ReactNode;
  accentColor: string;
}

export default function StatCard({ label, value, unit, trend, icon, accentColor }: StatCardProps) {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-4 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg', accentColor)}>{icon}</div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full',
              trend.direction === 'up'
                ? 'text-axiom-emerald bg-axiom-emerald/10'
                : 'text-axiom-red bg-axiom-red/10'
            )}
          >
            <span>{trend.direction === 'up' ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white stat-value tracking-tight">{value}</span>
        {unit && <span className="text-xs text-axiom-border-secondary font-medium">{unit}</span>}
      </div>
      <p className="text-[11px] text-axiom-border-secondary mt-1 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}
