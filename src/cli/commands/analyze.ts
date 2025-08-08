import ora from 'ora';
import chalk from 'chalk';
import { LighthouseRunner } from '../../core/lighthouse-runner';
import { FormatterFactory } from '../../formatters/formatter-factory';
import { FileWriter } from '../../utils/file-writer';
import { ErrorHandler } from '../../utils/error-handler';
import { UrlValidator } from '../../utils/url-validator';
import type { AnalyzeOptions } from '../../types/config';
import type { LampReport } from '../../types/report';

export class AnalyzeCommand {
  private runner = new LighthouseRunner();
  private errorHandler = new ErrorHandler();

  async execute(url: string, options: AnalyzeOptions): Promise<void> {
    const spinner = ora({
      text: 'Illuminating performance metrics...',
      spinner: 'dots12'
    }).start();

    try {
      // Validate and sanitize URL
      const sanitizedUrl = this.validateUrl(url);

      // Run Lighthouse
      spinner.text = `Analyzing ${chalk.cyan(url)}...`;
      const report = await this.runner.analyze(sanitizedUrl, {
        ...options,
        chrome: {
          headless: options.headless !== false,
          keepAlive: options.keepAlive
        }
      });

      // Format output
      spinner.text = 'Generating report...';
      const formatter = FormatterFactory.create(options.format || 'md');
      const output = await formatter.format(report, {
        template: options.template,
        includeEmoji: options.emoji !== false
      });

      // Write output
      const writer = new FileWriter();
      const outputPath = await writer.write(output, options.output || 'lighthouse-report.md');
      
      spinner.succeed(`Report saved to ${chalk.green(outputPath)}`);

      // Display summary
      this.displaySummary(report, options);

      // Check threshold
      if (options.threshold && report.scores.performance) {
        this.checkThreshold(report.scores.performance, options.threshold);
      }

    } catch (error: any) {
      spinner.fail('Analysis failed');
      this.errorHandler.handle(error);
      process.exit(1);
    }
  }

  private validateUrl(url: string): string {
    const validation = UrlValidator.validate(url);
    
    if (!validation.valid) {
      const error: any = new Error(validation.error || 'Invalid URL');
      error.code = 'INVALID_URL';
      error.url = url;
      throw error;
    }
    
    return validation.sanitized || url;
  }

  private displaySummary(report: LampReport, options: AnalyzeOptions): void {
    if (options.quiet) return;

    console.log('\n' + chalk.bold('Performance Summary:'));
    console.log('─'.repeat(40));
    
    const score = report.scores.performance || 0;
    const emoji = this.getScoreEmoji(score);
    const color = this.getScoreColor(score);
    
    console.log(`${emoji} Performance: ${color(score + '/100')}`);
    
    // Core Web Vitals
    if (report.metrics.lcp) {
      console.log(`  LCP: ${report.metrics.lcp.displayValue}`);
    }
    if (report.metrics.fid) {
      console.log(`  FID: ${report.metrics.fid.displayValue}`);
    }
    if (report.metrics.cls) {
      console.log(`  CLS: ${report.metrics.cls.displayValue}`);
    }
    
    if (options.fun) {
      console.log(chalk.yellow('\nPerformance analysis complete!'));
    }
  }

  private getScoreEmoji(score: number): string {
    if (score >= 90) return '[GOOD]';
    if (score >= 50) return '[OK]';
    return '[POOR]';
  }

  private getScoreColor(score: number): typeof chalk {
    if (score >= 90) return chalk.green;
    if (score >= 50) return chalk.yellow;
    return chalk.red;
  }

  private checkThreshold(score: number, threshold: number): void {
    if (score < threshold) {
      console.error(chalk.red(`\nWARNING: Performance score (${score}) is below threshold (${threshold})`));
      process.exit(1);
    }
  }
}