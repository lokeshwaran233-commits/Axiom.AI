import { FlaskConical, Cpu, Shield, BookOpen, Brain, ArrowRight } from 'lucide-react';
import { cn, getAgentColor, getAgentBgColor, getAgentLabel, formatRelativeTime } from '../../lib/utils';
import type { AgentActivityLog } from '../../types';

interface AgentActivityFeedProps {
  activities: AgentActivityLog[];
}

const agentIcons: Record<string, React.ReactNode> = {
  biosynthesis: <FlaskConical className="w-3.5 h-3.5" />,
  admet_skeptic: <Shield className="w-3.5 h-3.5" />,
  code_architect: <Cpu className="w-3.5 h-3.5" />,
  memory_broker: <BookOpen className="w-3.5 h-3.5" />,
  orchestrator: <Brain className="w-3.5 h-3.5" />,
};

export default function AgentActivityFeed({ activities }: AgentActivityFeedProps) {
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-label="Agent activity feed">
      {activities.length === 0 && (
        <div className="text-center py-8 text-axiom-border-secondary text-sm">
          No agent activity yet. Start a hypothesis to see live agent reasoning.
        </div>
      )}
      {activities.map((activity, i) => (
        <div
          key={activity.id}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg glass-panel glass-panel-hover animate-slide-in',
          )}
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className={cn('p-1.5 rounded-md mt-0.5', getAgentBgColor(activity.agent_type), getAgentColor(activity.agent_type))}>
            {agentIcons[activity.agent_type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn('text-xs font-semibold', getAgentColor(activity.agent_type))}>
                {getAgentLabel(activity.agent_type)}
              </span>
              <span className="text-[10px] text-axiom-border-secondary font-mono">
                {formatRelativeTime(activity.created_at)}
              </span>
              {activity.status === 'running' && (
                <span className="flex items-center gap-1 text-[10px] text-axiom-cyan">
                  <span className="w-1.5 h-1.5 bg-axiom-cyan rounded-full animate-pulse" />
                  Running
                </span>
              )}
            </div>
            <p className="text-xs text-axiom-border-secondary leading-relaxed line-clamp-2">
              {activity.action}
            </p>
            {activity.duration_ms > 0 && (
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-axiom-border-secondary">
                <span className="font-mono">{activity.duration_ms}ms</span>
                {activity.token_count > 0 && <span className="font-mono">{activity.token_count} tokens</span>}
              </div>
            )}
          </div>
          <ArrowRight className="w-3 h-3 text-axiom-border-secondary mt-1 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
