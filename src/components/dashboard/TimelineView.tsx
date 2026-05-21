import { FlaskConical, BookOpen, Brain, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { cn, formatRelativeTime, getAgentColor } from '../../lib/utils';
import type { TimelineEvent } from '../../types';

interface TimelineViewProps {
  events: TimelineEvent[];
}

const eventIcons: Record<string, React.ReactNode> = {
  hypothesis_created: <FlaskConical className="w-3.5 h-3.5" />,
  agent_action: <Brain className="w-3.5 h-3.5" />,
  simulation_started: <Play className="w-3.5 h-3.5" />,
  simulation_completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  version_generated: <BookOpen className="w-3.5 h-3.5" />,
  convergence_reached: <AlertCircle className="w-3.5 h-3.5" />,
};

const eventColors: Record<string, string> = {
  hypothesis_created: 'text-axiom-cyan bg-axiom-cyan/10 border-axiom-cyan/20',
  agent_action: 'text-axiom-amber bg-axiom-amber/10 border-axiom-amber/20',
  simulation_started: 'text-axiom-blue bg-axiom-blue/10 border-axiom-blue/20',
  simulation_completed: 'text-axiom-emerald bg-axiom-emerald/10 border-axiom-emerald/20',
  version_generated: 'text-axiom-cyan bg-axiom-cyan/10 border-axiom-cyan/20',
  convergence_reached: 'text-axiom-emerald bg-axiom-emerald/10 border-axiom-emerald/20',
};

export default function TimelineView({ events }: TimelineViewProps) {
  return (
    <div className="relative" role="status" aria-live="polite" aria-label="Pipeline timeline">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-axiom-border" />

      <div className="space-y-4">
        {events.map((event, i) => (
          <div
            key={event.id}
            className="relative flex items-start gap-4 animate-slide-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center w-[38px] h-[38px] rounded-full border',
                eventColors[event.type] || 'text-axiom-border-secondary bg-axiom-bg-tertiary border-axiom-border'
              )}
            >
              {eventIcons[event.type]}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-white">{event.title}</span>
                {event.agentType && (
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', getAgentColor(event.agentType))} style={{ background: 'rgba(34,211,238,0.08)' }}>
                    {event.agentType.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-xs text-axiom-border-secondary leading-relaxed">{event.description}</p>
              <span className="text-[10px] text-axiom-border-secondary font-mono mt-1 inline-block">
                {formatRelativeTime(event.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
