export function SkeletonRow({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-3 bg-axiom-bg-tertiary rounded flex-1" style={{ width: `${80 + Math.random() * 40}px` }} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel rounded-xl p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-axiom-bg-tertiary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-axiom-bg-tertiary" />
          <div className="h-2 w-48 rounded bg-axiom-bg-tertiary" />
        </div>
      </div>
      <div className="h-2 w-full rounded bg-axiom-bg-tertiary" />
      <div className="h-2 w-3/4 rounded bg-axiom-bg-tertiary" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="glass-panel rounded-xl p-4 text-center animate-pulse">
      <div className="w-4 h-4 mx-auto mb-2 rounded bg-axiom-bg-tertiary" />
      <div className="h-5 w-12 mx-auto rounded bg-axiom-bg-tertiary mb-1" />
      <div className="h-2 w-16 mx-auto rounded bg-axiom-bg-tertiary" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: React.FC<{ className?: string }>; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="w-10 h-10 text-axiom-border-secondary mb-4 opacity-30" />
      <p className="text-sm font-medium text-axiom-border-secondary">{title}</p>
      <p className="text-xs text-axiom-border-secondary mt-1 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20 hover:bg-axiom-cyan/20 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
