import { Search, Bell, User, Zap } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-axiom-border bg-axiom-bg-secondary/50 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-axiom-border-secondary mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-axiom-border-secondary" />
          <input
            id="global-search"
            type="text"
            placeholder="Search hypotheses, compounds..."
            aria-label="Search hypotheses, compounds"
            className="w-64 h-8 pl-9 pr-3 text-xs bg-axiom-bg-tertiary border border-axiom-border rounded-lg text-white placeholder:text-axiom-border-secondary focus:outline-none focus:border-axiom-cyan/50 focus:ring-1 focus:ring-axiom-cyan/20 transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-axiom-border-secondary bg-axiom-bg-elevated px-1.5 py-0.5 rounded border border-axiom-border font-mono" aria-hidden="true">
            /
          </kbd>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-axiom-emerald/10 border border-axiom-emerald/20" role="status">
          <Zap className="w-3 h-3 text-axiom-emerald" aria-hidden="true" />
          <span className="text-xs font-medium text-axiom-emerald">Pipeline Active</span>
        </div>

        {/* Notifications */}
        <button aria-label="Notifications" className="relative p-2 rounded-lg hover:bg-axiom-bg-tertiary transition-colors">
          <Bell className="w-4 h-4 text-axiom-border-secondary" aria-hidden="true" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-axiom-cyan rounded-full" aria-hidden="true" />
        </button>

        {/* User */}
        <button aria-label="User profile" className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-axiom-bg-tertiary transition-colors">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-axiom-cyan/20 to-axiom-emerald/10 border border-axiom-cyan/20 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-axiom-cyan" aria-hidden="true" />
          </div>
        </button>
      </div>
    </header>
  );
}
