import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadialBarChart, RadialBar } from 'recharts';
import { SystemMetrics } from '../types';
import { Database, Activity, Cpu, Thermometer, Gauge, Zap, Weight, DollarSign, Clock, Layers, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { CHART_COLORS, COLORS } from '../constants';

interface TelemetryPanelProps {
  metrics: SystemMetrics | null;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ metrics }) => {
  return (
    <div className="h-full border-l border-mm-graphite bg-mm-black/80 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-mm-graphite bg-gradient-to-b from-mm-graphite/20 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-mm-graphite/50 border border-mm-teal/30 rounded
                          flex items-center justify-center">
            <Activity className="w-4 h-4 text-mm-teal" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-mm-teal tracking-widest uppercase">
              System Telemetry
            </h2>
            <p className="font-mono text-[9px] text-mm-steel uppercase tracking-widest">
              Real-time Metrics
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {metrics ? (
          <TelemetryContent metrics={metrics} />
        ) : (
          <EmptyTelemetry />
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

const EmptyTelemetry: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="relative w-20 h-20 mb-6">
      {/* Animated rings */}
      <div className="absolute inset-0 border border-dashed border-mm-blueprint/30 rounded-full
                      animate-[spin_20s_linear_infinite]" />
      <div className="absolute inset-2 border border-mm-blueprint/20 rounded-full
                      animate-[spin_15s_linear_infinite_reverse]" />
      <div className="absolute inset-4 bg-mm-graphite/30 rounded-full 
                      flex items-center justify-center">
        <Database className="w-8 h-8 text-mm-steel/30" />
      </div>
    </div>
    
    <p className="font-mono text-xs text-mm-steel uppercase tracking-wider mb-2">
      No Telemetry Data
    </p>
    <p className="font-mono text-[10px] text-mm-steel/50 max-w-[200px]">
      Metrics will appear after system processes a query
    </p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRY CONTENT
// ─────────────────────────────────────────────────────────────────────────────

const TelemetryContent: React.FC<{ metrics: SystemMetrics }> = ({ metrics }) => {
  // Handle multiple metrics with navigation
  const allMetrics = metrics.allMetrics || [metrics];
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const activeMetric = allMetrics[activeChartIndex];
  
  // Calculate total for percentage display
  const total = activeMetric.data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="p-4 space-y-5">
      {/* Project Summary - if available */}
      {metrics.summary && (
        <div className="animate-fade-slide-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-4 bg-mm-cyan rounded-full" />
            <h3 className="font-mono text-xs text-white uppercase tracking-wider">
              Project Summary
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {metrics.summary.totalWeight && (
              <SummaryCard 
                icon={<Weight className="w-3.5 h-3.5" />}
                label="Total Weight"
                value={metrics.summary.totalWeight}
              />
            )}
            {metrics.summary.totalPower && (
              <SummaryCard 
                icon={<Zap className="w-3.5 h-3.5" />}
                label="Power Draw"
                value={metrics.summary.totalPower}
              />
            )}
            {metrics.summary.estimatedCost && (
              <SummaryCard 
                icon={<DollarSign className="w-3.5 h-3.5" />}
                label="Est. Cost"
                value={metrics.summary.estimatedCost}
              />
            )}
            {metrics.summary.complexity && (
              <SummaryCard 
                icon={<Layers className="w-3.5 h-3.5" />}
                label="Complexity"
                value={metrics.summary.complexity}
              />
            )}
            {metrics.summary.flightTime && (
              <SummaryCard 
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Flight Time"
                value={metrics.summary.flightTime}
              />
            )}
          </div>
        </div>
      )}

      {/* Chart Section with navigation for multiple charts */}
      <div className="animate-fade-slide-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-mm-teal rounded-full" />
            <h3 className="font-mono text-xs text-white uppercase tracking-wider">
              {activeMetric.title}
            </h3>
            {activeMetric.unit && (
              <span className="font-mono text-[9px] text-mm-teal/60">({activeMetric.unit})</span>
            )}
          </div>
          
          {/* Navigation for multiple charts */}
          {allMetrics.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveChartIndex(i => (i - 1 + allMetrics.length) % allMetrics.length)}
                className="p-1 rounded hover:bg-mm-teal/10 text-white/50 hover:text-mm-teal transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[9px] text-white/40">
                {activeChartIndex + 1}/{allMetrics.length}
              </span>
              <button
                onClick={() => setActiveChartIndex(i => (i + 1) % allMetrics.length)}
                className="p-1 rounded hover:bg-mm-teal/10 text-white/50 hover:text-mm-teal transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-mm-graphite/30 border border-mm-blueprint/30 rounded p-4">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric.type === 'pie' ? (
                <PieChart>
                  <Pie
                    data={activeMetric.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke={COLORS.background}
                    strokeWidth={2}
                  >
                    {activeMetric.data.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip unit={activeMetric.unit} total={total} />} />
                  <Legend 
                    content={<CustomLegend />}
                    verticalAlign="bottom"
                  />
                </PieChart>
              ) : (
                <BarChart data={activeMetric.data} barCategoryGap="15%">
                  <XAxis 
                    dataKey="name" 
                    stroke={COLORS.border}
                    fontSize={8}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={{ stroke: COLORS.border }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    stroke={COLORS.border}
                    fontSize={9}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    axisLine={{ stroke: COLORS.border }}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip unit={activeMetric.unit} />} cursor={{ fill: COLORS.panel }} />
                  <Bar 
                    dataKey="value" 
                    radius={[3, 3, 0, 0]}
                  >
                    {activeMetric.data.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Total indicator */}
          <div className="mt-3 pt-3 border-t border-mm-blueprint/20 flex items-center justify-between">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">
              Total
            </span>
            <span className="font-mono text-sm text-mm-teal font-bold">
              {total.toLocaleString()}{activeMetric.unit ? ` ${activeMetric.unit}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="h-px bg-gradient-to-r from-transparent via-mm-blueprint/50 to-transparent" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                         bg-mm-black px-2 font-mono text-[8px] text-mm-steel uppercase tracking-widest">
          System Status
        </span>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-2 animate-fade-slide-in delay-2">
        <StatusBlock 
          icon={<Cpu className="w-3.5 h-3.5" />}
          label="Compute Node"
          value="Online"
          status="good"
        />
        <StatusBlock 
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          label="Data Points"
          value={`${activeMetric.data.length}`}
          status="normal"
        />
        <StatusBlock 
          icon={<Gauge className="w-3.5 h-3.5" />}
          label="Precision"
          value="Float32"
          status="normal"
        />
        <StatusBlock 
          icon={<Activity className="w-3.5 h-3.5" />}
          label="Charts"
          value={`${allMetrics.length}`}
          status="normal"
        />
      </div>

      {/* Data breakdown */}
      <div className="bg-mm-graphite/20 border border-mm-blueprint/20 rounded p-3
                      animate-fade-slide-in delay-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[9px] text-white/50 uppercase tracking-wider">
            Breakdown
          </span>
          <span className="font-mono text-[8px] text-mm-teal/50">
            % of total
          </span>
        </div>
        <div className="space-y-2">
          {activeMetric.data.slice(0, 5).map((item, idx) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-sm" 
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span className="font-mono text-[10px] text-white/80 truncate max-w-[100px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-white/50">
                      {percentage}%
                    </span>
                    <span className="font-mono text-xs text-mm-teal font-medium min-w-[45px] text-right">
                      {item.value}{activeMetric.unit ? activeMetric.unit : ''}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-mm-black/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: CHART_COLORS[idx % CHART_COLORS.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
          {activeMetric.data.length > 5 && (
            <div className="font-mono text-[9px] text-white/40 pt-1 text-center">
              +{activeMetric.data.length - 5} more items
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY CARD — Compact metric display
// ─────────────────────────────────────────────────────────────────────────────

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value }) => (
  <div className="bg-gradient-to-br from-mm-graphite/40 to-mm-graphite/20 
                  border border-mm-blueprint/30 rounded p-2.5">
    <div className="flex items-center gap-1.5 mb-1 text-mm-teal/70">
      {icon}
      <span className="font-mono text-[8px] uppercase tracking-wider truncate">
        {label}
      </span>
    </div>
    <div className="font-mono text-sm text-white font-bold truncate">
      {value}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BLOCK
// ─────────────────────────────────────────────────────────────────────────────

interface StatusBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: 'good' | 'warning' | 'normal';
}

const StatusBlock: React.FC<StatusBlockProps> = ({ icon, label, value, status = 'normal' }) => {
  const statusColors = {
    good: 'text-mm-teal',
    warning: 'text-mm-warning',
    normal: 'text-white',
  };

  return (
    <div className="bg-mm-graphite/30 border border-mm-blueprint/30 rounded p-3">
      <div className="flex items-center gap-2 mb-2 text-white/50">
        {icon}
        <span className="font-mono text-[9px] uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <div className={`font-mono text-sm font-bold ${statusColors[status]}`}>
        {value}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  unit?: string;
  total?: number;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, unit, total }) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0];
  const value = data.value;
  const percentage = total && total > 0 ? ((value / total) * 100).toFixed(1) : null;
  
  return (
    <div className="bg-mm-black border border-mm-teal/30 rounded px-3 py-2 shadow-lg">
      <div className="font-mono text-[10px] text-white/60 uppercase tracking-wider mb-1">
        {data.name || data.payload?.name}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm text-mm-teal font-bold">
          {value.toLocaleString()}{unit ? ` ${unit}` : ''}
        </span>
        {percentage && (
          <span className="font-mono text-[10px] text-mm-cyan/70">
            ({percentage}%)
          </span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM LEGEND
// ─────────────────────────────────────────────────────────────────────────────

const CustomLegend: React.FC<any> = ({ payload }) => {
  if (!payload?.length) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-mono text-[9px] text-white/70 uppercase tracking-wider">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};
