import { FileText, Download, Shield, Clock, CheckCircle2 } from 'lucide-react';

const mockReports = [
  {
    id: 'r1',
    title: 'c-Myc Hypothesis Audit Trail',
    type: 'Audit Report',
    hypothesis: 'c-Myc / MYC',
    generatedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'ready',
    pages: 24,
    format: 'PDF',
  },
  {
    id: 'r2',
    title: 'c-Fos Convergence Summary',
    type: 'Convergence Report',
    hypothesis: 'c-Fos / FOS',
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'ready',
    pages: 18,
    format: 'PDF',
  },
  {
    id: 'r3',
    title: 'BRAF V600E Simulation Log Export',
    type: 'Simulation Log',
    hypothesis: 'BRAF V600E',
    generatedAt: new Date(Date.now() - 43200000).toISOString(),
    status: 'ready',
    pages: 42,
    format: 'JSON',
  },
  {
    id: 'r4',
    title: 'Q1 2026 Negative Data Vault Summary',
    type: 'Negative Data Report',
    hypothesis: 'All',
    generatedAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'ready',
    pages: 56,
    format: 'PDF',
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Generate Report */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-axiom-cyan" />
          <h2 className="text-sm font-semibold text-white">Generate Report</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Audit Trail', desc: 'Full agent reasoning trace with tool call provenance', icon: Shield },
            { label: 'Convergence Summary', desc: 'Hypothesis evolution, scores, and final recommendation', icon: CheckCircle2 },
            { label: 'Simulation Export', desc: 'Raw simulation logs, docking poses, and MD trajectories', icon: Clock },
          ].map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.label}
                className="flex flex-col items-start gap-2 p-4 rounded-lg bg-axiom-bg-tertiary border border-axiom-border hover:border-axiom-cyan/30 hover:bg-axiom-cyan/5 transition-all text-left"
              >
                <Icon className="w-4 h-4 text-axiom-cyan" />
                <div>
                  <div className="text-xs font-semibold text-white">{report.label}</div>
                  <div className="text-[10px] text-axiom-border-secondary mt-0.5">{report.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Existing Reports */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Generated Reports</h2>
          <span className="text-[10px] text-axiom-border-secondary font-mono">{mockReports.length} reports</span>
        </div>
        <div className="space-y-2">
          {mockReports.map((report, i) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-3 rounded-lg glass-panel glass-panel-hover animate-slide-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-axiom-bg-tertiary">
                  <FileText className="w-4 h-4 text-axiom-border-secondary" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{report.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-axiom-cyan">{report.type}</span>
                    <span className="text-[10px] text-axiom-border-secondary">{report.hypothesis}</span>
                    <span className="text-[10px] text-axiom-border-secondary">{report.pages} pages</span>
                    <span className="text-[10px] text-axiom-border-secondary font-mono">{report.format}</span>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold text-axiom-cyan bg-axiom-cyan/10 border border-axiom-cyan/20 hover:bg-axiom-cyan/20 transition-all">
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
