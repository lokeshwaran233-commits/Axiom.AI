import { User, Building2, Key, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Profile */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-axiom-cyan" />
          <h2 className="text-sm font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="settings-fullname" className="block text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              id="settings-fullname"
              type="text"
              defaultValue="Dr. Sarah Chen"
              className="w-full h-9 px-3 text-sm bg-axiom-bg-tertiary border border-axiom-border rounded-lg text-white focus:outline-none focus:border-axiom-cyan/50"
            />
          </div>
          <div>
            <label htmlFor="settings-institution" className="block text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5">Institution</label>
            <input
              id="settings-institution"
              type="text"
              defaultValue="Stanford School of Medicine"
              className="w-full h-9 px-3 text-sm bg-axiom-bg-tertiary border border-axiom-border rounded-lg text-white focus:outline-none focus:border-axiom-cyan/50"
            />
          </div>
          <div>
            <label htmlFor="settings-role" className="block text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5">Role</label>
            <select id="settings-role" className="w-full h-9 px-3 text-sm bg-axiom-bg-tertiary border border-axiom-border rounded-lg text-white focus:outline-none focus:border-axiom-cyan/50">
              <option value="researcher">Researcher</option>
              <option value="pi">Principal Investigator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-axiom-cyan" />
          <h2 className="text-sm font-semibold text-white">Subscription</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { tier: 'Academic', price: '$499/mo', current: true },
            { tier: 'Biotech Pro', price: '$4,999/mo', current: false },
            { tier: 'Pharma Enterprise', price: '$50K+/yr', current: false },
          ].map((plan) => (
            <div
              key={plan.tier}
              className={cn(
                'p-4 rounded-lg border text-center transition-all',
                plan.current
                  ? 'border-axiom-cyan/40 bg-axiom-cyan/5'
                  : 'border-axiom-border bg-axiom-bg-tertiary hover:border-axiom-border-secondary'
              )}
            >
              <div className="text-xs font-semibold text-white">{plan.tier}</div>
              <div className="text-sm font-bold text-axiom-cyan mt-1">{plan.price}</div>
              {plan.current && (
                <span className="text-[10px] text-axiom-emerald font-semibold mt-2 inline-block">Current Plan</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Configuration */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-axiom-cyan" />
          <h2 className="text-sm font-semibold text-white">API Configuration</h2>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Anthropic API Key', status: 'Connected', model: 'Claude Sonnet 4.6' },
            { name: 'Amazon Neptune', status: 'Connected', model: 'Serverless' },
            { name: 'AWS Fargate', status: 'Connected', model: 'us-east-1' },
          ].map((api) => (
            <div key={api.name} className="flex items-center justify-between py-2 border-b border-axiom-border/50 last:border-0">
              <div>
                <span className="text-xs text-white font-medium">{api.name}</span>
                <span className="text-[10px] text-axiom-border-secondary ml-2">{api.model}</span>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] text-axiom-emerald font-medium">
                <span className="w-1.5 h-1.5 bg-axiom-emerald rounded-full" />
                {api.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-axiom-cyan" />
          <h2 className="text-sm font-semibold text-white">Security & Compliance</h2>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Row Level Security (RLS)', status: 'Enabled' },
            { label: 'HIPAA Compliance Mode', status: 'Enabled' },
            { label: 'Biosecurity Screening', status: 'Active' },
            { label: 'Audit Logging', status: 'Active' },
            { label: 'MFA Authentication', status: 'Enabled' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-axiom-border/50 last:border-0">
              <span className="text-xs text-white">{item.label}</span>
              <span className="text-[10px] text-axiom-emerald font-medium">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
