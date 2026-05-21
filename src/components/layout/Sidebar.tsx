import { useState } from 'react';
import {
  FlaskConical,
  LayoutDashboard,
  Network,
  Cpu,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Atom,
  Shield,
  FileText,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hypotheses', label: 'Hypotheses', icon: FlaskConical },
  { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Network },
  { id: 'simulations', label: 'Simulations', icon: Cpu },
  { id: 'agents', label: 'Agent Trace', icon: Shield },
  { id: 'literature', label: 'Literature', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: FileText },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen flex flex-col border-r border-axiom-border bg-axiom-bg-secondary transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-axiom-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-axiom-cyan/20 to-axiom-emerald/10 border border-axiom-cyan/30" aria-label="Axiom.AI logo">
          <Atom className="w-4 h-4 text-axiom-cyan" aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <div className="text-sm font-semibold tracking-tight text-white">Axiom.AI</div>
            <div className="text-[10px] text-axiom-cyan/70 font-medium tracking-wider uppercase">Life Sciences</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20'
                  : 'text-axiom-border-secondary hover:text-white hover:bg-axiom-bg-tertiary border border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-axiom-cyan')} aria-hidden="true" />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="py-4 px-2 space-y-1 border-t border-axiom-border">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-axiom-cyan/10 text-axiom-cyan'
                  : 'text-axiom-border-secondary hover:text-white hover:bg-axiom-bg-tertiary'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="px-2 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-axiom-border-secondary hover:text-white hover:bg-axiom-bg-tertiary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" aria-hidden="true" /> : <ChevronLeft className="w-4 h-4" aria-hidden="true" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
