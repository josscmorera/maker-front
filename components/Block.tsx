import React from 'react';
import { 
  Target, Layers, Calculator, ListChecks, Wrench, ShieldCheck, 
  AlertTriangle, CheckCircle2, Loader2, LucideIcon 
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK COMPONENT — Engineering-grade content container
// ─────────────────────────────────────────────────────────────────────────────

interface BlockProps {
  title: string;
  number?: string;
  icon?: 'target' | 'layers' | 'calculator' | 'list' | 'wrench' | 'shield-check' | 'warning';
  variant?: 'default' | 'highlighted' | 'warning';
  status?: 'idle' | 'active' | 'complete';
  footer?: React.ReactNode;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}

const ICONS: Record<string, LucideIcon> = {
  'target': Target,
  'layers': Layers,
  'calculator': Calculator,
  'list': ListChecks,
  'wrench': Wrench,
  'shield-check': ShieldCheck,
  'warning': AlertTriangle,
};

export const Block: React.FC<BlockProps> = ({ 
  title, 
  number, 
  icon,
  variant = 'default', 
  status = 'idle',
  footer,
  className = '',
  delay = 0,
  children 
}) => {
  const IconComponent = icon ? ICONS[icon] : null;
  
  const variantClasses = {
    default: 'border-mm-blueprint',
    highlighted: 'border-mm-teal shadow-[0_0_20px_rgba(14,231,199,0.15)]',
    warning: 'border-mm-warning',
  };
  
  const headerClasses = {
    default: 'text-mm-teal',
    highlighted: 'text-mm-teal',
    warning: 'text-mm-warning',
  };

  return (
    <div 
      className={`
        relative bg-mm-graphite/80 border rounded overflow-hidden
        animate-fade-slide-in opacity-0
        ${variantClasses[variant]}
        ${className}
      `}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Top accent line */}
      <div className={`
        absolute top-0 left-0 right-0 h-[2px]
        ${variant === 'warning' 
          ? 'bg-gradient-to-r from-transparent via-mm-warning to-transparent' 
          : 'bg-gradient-to-r from-transparent via-mm-teal to-transparent'
        }
        opacity-60
      `} />
      
      {/* Header */}
      <div className={`
        flex items-center gap-3 px-4 py-3
        border-b border-mm-blueprint/50
        bg-gradient-to-b ${variant === 'warning' 
          ? 'from-mm-warning/5 to-transparent' 
          : 'from-mm-teal/5 to-transparent'
        }
      `}>
        {/* Number badge */}
        {number && (
          <div className="flex items-center justify-center w-7 h-7 
                          bg-mm-black/50 border border-mm-blueprint rounded-sm
                          font-mono text-xs font-bold text-mm-teal/60">
            {number}
          </div>
        )}
        
        {/* Icon */}
        {IconComponent && (
          <IconComponent className={`w-4 h-4 ${headerClasses[variant]} opacity-70`} />
        )}
        
        {/* Title */}
        <h3 className={`
          flex-1 font-display font-semibold text-sm uppercase tracking-wider
          ${headerClasses[variant]}
        `}>
          {title}
        </h3>
        
        {/* Status indicator */}
        {status !== 'idle' && (
          <div className="flex items-center gap-2">
            {status === 'active' && (
              <Loader2 className="w-4 h-4 text-mm-teal animate-spin" />
            )}
            {status === 'complete' && (
              <CheckCircle2 className="w-4 h-4 text-mm-teal" />
            )}
          </div>
        )}
      </div>
      
      {/* Body */}
      <div className="p-4">
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className="px-4 py-2 border-t border-dashed border-mm-blueprint/30
                        font-mono text-[10px] text-mm-steel uppercase tracking-wider
                        flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLE BLOCK — Minimal variant without header decoration
// ─────────────────────────────────────────────────────────────────────────────

interface SimpleBlockProps {
  className?: string;
  children: React.ReactNode;
}

export const SimpleBlock: React.FC<SimpleBlockProps> = ({ className = '', children }) => {
  return (
    <div className={`
      bg-mm-graphite/50 border border-mm-blueprint/50 rounded-sm p-4
      ${className}
    `}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA BLOCK — For displaying key-value metrics
// ─────────────────────────────────────────────────────────────────────────────

interface DataBlockProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'normal' | 'good' | 'warning' | 'danger';
  className?: string;
}

export const DataBlock: React.FC<DataBlockProps> = ({ 
  label, 
  value, 
  unit, 
  status = 'normal',
  className = '' 
}) => {
  const statusColors = {
    normal: 'text-white',
    good: 'text-mm-teal',
    warning: 'text-mm-warning',
    danger: 'text-mm-danger',
  };

  return (
    <div className={`
      bg-mm-carbon border border-mm-blueprint/50 p-3 rounded-sm
      ${className}
    `}>
      <div className="font-mono text-[10px] text-white/50 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`font-mono text-lg font-bold ${statusColors[status]}`}>
        {value}
        {unit && <span className="text-xs ml-1 opacity-60">{unit}</span>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER — For major content divisions
// ─────────────────────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  number: string;
  title: string;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title, subtitle }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-display text-4xl font-bold text-mm-teal/20">
        {number}
      </span>
      <div className="flex-1">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-mm-teal">
          {title}
        </h2>
        {subtitle && (
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-mm-blueprint to-transparent" />
    </div>
  );
};

