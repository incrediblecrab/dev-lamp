export interface DevLampConfig {
  output?: OutputConfig;
  chrome?: ChromeConfig;
  lighthouse?: LighthouseConfig;
  preferences?: PreferencesConfig;
}

export interface OutputConfig {
  format?: 'md' | 'txt' | 'json';
  template?: 'minimal' | 'detailed' | 'github';
  path?: string;
}

export interface ChromeConfig {
  headless?: boolean;
  keepAlive?: boolean;
  chromePath?: string;
  port?: number;
}

export interface LighthouseConfig {
  categories?: Array<'performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa'>;
  device?: 'mobile' | 'desktop';
  throttling?: ThrottlingConfig;
}

export interface ThrottlingConfig {
  cpuSlowdownMultiplier?: number;
  requestLatencyMs?: number;
  downloadThroughputKbps?: number;
  uploadThroughputKbps?: number;
}

export interface PreferencesConfig {
  emoji?: boolean;
  color?: boolean;
  quiet?: boolean;
}

export interface AnalyzeOptions {
  output?: string;
  format?: 'md' | 'txt' | 'json';
  template?: 'minimal' | 'detailed' | 'github';
  device?: 'mobile' | 'desktop';
  categories?: string;
  threshold?: number;
  headless?: boolean;
  keepAlive?: boolean;
  quiet?: boolean;
  fun?: boolean;
  emoji?: boolean;
  chrome?: ChromeConfig;
}