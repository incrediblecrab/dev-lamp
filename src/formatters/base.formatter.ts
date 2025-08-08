import type { LampReport, FormatterOptions } from '../types/report';

export abstract class BaseFormatter {
  abstract format(report: LampReport, options: FormatterOptions): Promise<string>;
  
  protected getScoreEmoji(score: number): string {
    if (score >= 90) return '[GOOD]';
    if (score >= 50) return '[OK]';
    return '[POOR]';
  }

  protected getScoreLabel(score: number): string {
    if (score >= 90) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  }

  protected formatMs(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  }

  protected formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}