export enum MessageType {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  chartData?: SystemMetrics | null;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
  [key: string]: any;
}

export interface MetricsSummary {
  totalWeight?: string;
  totalPower?: string;
  estimatedCost?: string;
  complexity?: string;
  flightTime?: string;
  [key: string]: string | undefined;
}

export interface SystemMetrics {
  title: string;
  type: 'pie' | 'bar';
  unit?: string;
  data: ChartDataPoint[];
  // Extended metrics support
  allMetrics?: SystemMetrics[];
  summary?: MetricsSummary | null;
}

export interface ProjectState {
  isProcessing: boolean;
  currentPhase: string;
}