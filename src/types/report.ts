export interface LampReport {
  metadata: ReportMetadata;
  scores: ReportScores;
  metrics: ReportMetrics;
  opportunities?: Opportunity[];
  diagnostics?: Diagnostic[];
}

export interface ReportMetadata {
  url: string;
  timestamp: string;
  device?: string;
  lighthouseVersion?: string;
}

export interface ReportScores {
  performance?: number;
  accessibility?: number;
  bestPractices?: number;
  seo?: number;
  pwa?: number;
}

export interface ReportMetrics {
  lcp?: Metric;
  fid?: Metric;
  cls?: Metric;
  fcp?: Metric;
  ttfb?: Metric;
  speedIndex?: Metric;
  totalBlockingTime?: Metric;
  cumulativeLayoutShift?: Metric;
  [key: string]: Metric | undefined;
}

export interface Metric {
  score: number;
  value: number;
  displayValue: string;
  title?: string;
  description?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  details?: any;
}

export interface Diagnostic {
  id: string;
  title: string;
  description: string;
  score: number;
  displayValue?: string;
  details?: any;
}

export interface FormatterOptions {
  template?: string;
  includeEmoji?: boolean;
}