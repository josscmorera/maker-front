import React from 'react';
import { 
  Target, Layers, Calculator, ListChecks, Wrench, ShieldCheck, 
  CheckCircle2, Circle, Loader2, LucideIcon
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// REASON FLOW — Visual reasoning path visualization
// ─────────────────────────────────────────────────────────────────────────────

interface ReasonStep {
  id: string;
  label: string;
  title: string;
  status: 'pending' | 'active' | 'complete';
  content?: React.ReactNode;
}

interface ReasonFlowProps {
  steps: ReasonStep[];
  className?: string;
}

const STEP_ICONS: Record<string, LucideIcon> = {
  'understanding': Target,
  'decomposition': Layers,
  'calculations': Calculator,
  'bom': ListChecks,
  'build': Wrench,
  'testing': ShieldCheck,
};

export const ReasonFlow: React.FC<ReasonFlowProps> = ({ steps, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Vertical connector line */}
      <div className="absolute left-[11px] top-8 bottom-8 w-[2px] 
                      bg-gradient-to-b from-mm-teal via-mm-blueprint/50 to-transparent" />
      
      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <ReasonNode 
            key={step.id} 
            step={step} 
            index={index}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// REASON NODE — Individual step in the reasoning flow
// ─────────────────────────────────────────────────────────────────────────────

interface ReasonNodeProps {
  step: ReasonStep;
  index: number;
  isLast: boolean;
}

const ReasonNode: React.FC<ReasonNodeProps> = ({ step, index, isLast }) => {
  const IconComponent = STEP_ICONS[step.id] || Circle;
  
  return (
    <div 
      className="relative pl-10 animate-fade-slide-in opacity-0"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'forwards'
      }}
    >
      {/* Node indicator */}
      <div className={`
        absolute left-0 top-1 w-6 h-6 rounded-full
        flex items-center justify-center
        border-2 transition-all duration-300
        ${step.status === 'complete' 
          ? 'bg-mm-teal border-mm-teal' 
          : step.status === 'active'
            ? 'bg-mm-black border-mm-teal shadow-[0_0_12px_rgba(14,231,199,0.4)]'
            : 'bg-mm-black border-mm-blueprint'
        }
      `}>
        {step.status === 'complete' && (
          <CheckCircle2 className="w-3 h-3 text-mm-black" />
        )}
        {step.status === 'active' && (
          <Loader2 className="w-3 h-3 text-mm-teal animate-spin" />
        )}
        {step.status === 'pending' && (
          <Circle className="w-2 h-2 text-mm-steel" />
        )}
      </div>
      
      {/* Content */}
      <div className={`
        ${step.status === 'pending' ? 'opacity-40' : ''}
      `}>
        {/* Label */}
        <div className="font-mono text-[10px] uppercase tracking-widest text-mm-teal mb-1">
          {step.label}
        </div>
        
        {/* Title */}
        <div className={`
          font-display text-sm uppercase tracking-wide mb-2
          ${step.status === 'active' ? 'text-mm-teal' : 'text-white'}
        `}>
          {step.title}
        </div>
        
        {/* Content (if provided and step is active/complete) */}
        {step.content && step.status !== 'pending' && (
          <div className="text-sm text-white/80 leading-relaxed">
            {step.content}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MINI FLOW — Compact horizontal flow indicator
// ─────────────────────────────────────────────────────────────────────────────

interface MiniFlowStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}

interface MiniFlowProps {
  steps: MiniFlowStep[];
  className?: string;
}

export const MiniFlow: React.FC<MiniFlowProps> = ({ steps, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${step.status === 'complete' 
                ? 'bg-mm-teal shadow-[0_0_6px_rgba(14,231,199,0.4)]' 
                : step.status === 'active'
                  ? 'bg-mm-teal animate-pulse shadow-[0_0_8px_rgba(14,231,199,0.6)]'
                  : 'bg-mm-steel'
              }
            `} />
            <span className={`
              font-mono text-[9px] uppercase tracking-wider
              ${step.status === 'active' ? 'text-mm-teal' : 'text-white/50'}
            `}>
              {step.label}
            </span>
          </div>
          
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className={`
              w-8 h-px
              ${step.status === 'complete' 
                ? 'bg-mm-teal' 
                : 'bg-mm-blueprint'
              }
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS FLOW — For showing overall progress
// ─────────────────────────────────────────────────────────────────────────────

interface ProgressFlowProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export const ProgressFlow: React.FC<ProgressFlowProps> = ({ 
  current, 
  total, 
  label,
  className = '' 
}) => {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className={`${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
            {label}
          </span>
          <span className="font-mono text-xs text-mm-teal">
            {current}/{total}
          </span>
        </div>
      )}
      
      <div className="relative h-1 bg-mm-graphite rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-mm-teal to-mm-cyan
                     transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Glow effect */}
        <div 
          className="absolute top-0 h-full w-4 bg-gradient-to-r from-transparent to-mm-teal/50
                     blur-sm transition-all duration-500"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT REASONING STEPS — Pre-configured for MakerMind output
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_REASON_STEPS: ReasonStep[] = [
  { id: 'understanding', label: 'Phase 01', title: 'Project Understanding', status: 'pending' },
  { id: 'decomposition', label: 'Phase 02', title: 'Engineering Decomposition', status: 'pending' },
  { id: 'calculations', label: 'Phase 03', title: 'Calculations & Logic', status: 'pending' },
  { id: 'bom', label: 'Phase 04', title: 'Bill of Materials', status: 'pending' },
  { id: 'build', label: 'Phase 05', title: 'Build Blueprint', status: 'pending' },
  { id: 'testing', label: 'Phase 06', title: 'Testing & Analysis', status: 'pending' },
];

