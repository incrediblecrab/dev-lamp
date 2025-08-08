import lighthouse from 'lighthouse';
import { ChromeManager } from './chrome-manager';
import type { AnalyzeOptions } from '../types/config';
import type { LampReport, ReportScores, ReportMetrics, Opportunity, Diagnostic } from '../types/report';

export class LighthouseRunner {
  private chromeManager = ChromeManager.getInstance();
  private readonly MAX_WAIT_FOR_LOAD = 90000; // 90 seconds
  private readonly MAX_GATHER_TIME = 180000; // 180 seconds (3 minutes)

  async analyze(url: string, options: AnalyzeOptions = {}): Promise<LampReport> {
    const chrome = await this.chromeManager.getChrome(options.chrome || {});
    
    try {
      const categories = this.parseCategories(options.categories);
      const lighthouseOptions: any = {
        port: chrome.port,
        output: 'json',
        onlyCategories: categories,
        formFactor: options.device || 'desktop',
        screenEmulation: this.getScreenEmulation(options.device || 'desktop'),
        throttling: this.getThrottling(options.device || 'desktop'),
        maxWaitForLoad: this.MAX_WAIT_FOR_LOAD,
        maxWaitForFcp: this.MAX_WAIT_FOR_LOAD,
        gatherMode: false,
        disableStorageReset: false,
        skipAboutBlank: true
      };

      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Lighthouse audit timed out after 180 seconds')), this.MAX_GATHER_TIME);
      });
      
      const lighthousePromise = lighthouse(url, lighthouseOptions);
      const runnerResult = await Promise.race([lighthousePromise, timeoutPromise]) as any;
      
      if (!runnerResult?.lhr) {
        throw new Error('Failed to generate Lighthouse report');
      }

      return this.parseReport(runnerResult.lhr);
      
    } finally {
      if (!options.keepAlive) {
        await this.chromeManager.cleanup();
      }
    }
  }

  private parseCategories(categoriesString?: string): string[] {
    if (!categoriesString) {
      return ['performance'];
    }
    
    const categories = categoriesString.split(',').map(c => c.trim());
    const validCategories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'];
    
    return categories.filter(c => validCategories.includes(c));
  }

  private getScreenEmulation(device: string) {
    if (device === 'mobile') {
      return {
        mobile: true,
        width: 412,
        height: 823,
        deviceScaleFactor: 2.625,
        disabled: false
      };
    }
    return {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    };
  }

  private getThrottling(device: string) {
    if (device === 'mobile') {
      return {
        cpuSlowdownMultiplier: 4,
        requestLatencyMs: 150,
        downloadThroughputKbps: 1638.4,
        uploadThroughputKbps: 675
      };
    }
    return {
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    };
  }

  private parseReport(lhr: any): LampReport {
    return {
      metadata: {
        url: lhr.finalUrl || lhr.requestedUrl,
        timestamp: new Date().toISOString(),
        device: lhr.configSettings?.formFactor,
        lighthouseVersion: lhr.lighthouseVersion
      },
      scores: this.extractScores(lhr.categories),
      metrics: this.extractMetrics(lhr.audits),
      opportunities: this.extractOpportunities(lhr.audits),
      diagnostics: this.extractDiagnostics(lhr.audits)
    };
  }

  private extractScores(categories: any): ReportScores {
    const scores: ReportScores = {};
    
    if (categories?.performance) {
      scores.performance = Math.round(categories.performance.score * 100);
    }
    if (categories?.accessibility) {
      scores.accessibility = Math.round(categories.accessibility.score * 100);
    }
    if (categories?.['best-practices']) {
      scores.bestPractices = Math.round(categories['best-practices'].score * 100);
    }
    if (categories?.seo) {
      scores.seo = Math.round(categories.seo.score * 100);
    }
    if (categories?.pwa) {
      scores.pwa = Math.round(categories.pwa.score * 100);
    }
    
    return scores;
  }

  private extractMetrics(audits: any): ReportMetrics {
    const metrics: ReportMetrics = {};
    
    const metricMappings = {
      'largest-contentful-paint': 'lcp',
      'first-contentful-paint': 'fcp',
      'cumulative-layout-shift': 'cls',
      'total-blocking-time': 'totalBlockingTime',
      'speed-index': 'speedIndex',
      'interactive': 'tti',
      'server-response-time': 'ttfb'
    };

    for (const [auditKey, metricKey] of Object.entries(metricMappings)) {
      if (audits[auditKey]) {
        const audit = audits[auditKey];
        metrics[metricKey] = {
          score: Math.round((audit.score || 0) * 100),
          value: audit.numericValue || 0,
          displayValue: audit.displayValue || 'N/A',
          title: audit.title,
          description: audit.description
        };
      }
    }

    // Add FID placeholder (Lighthouse doesn't measure real FID, uses TBT as proxy)
    if (metrics.totalBlockingTime) {
      metrics.fid = {
        ...metrics.totalBlockingTime,
        title: 'First Input Delay (estimated)',
        description: 'Estimated using Total Blocking Time as a proxy'
      };
    }

    return metrics;
  }

  private extractOpportunities(audits: any): Opportunity[] {
    const opportunities: Opportunity[] = [];
    
    const opportunityAudits = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images',
      'efficient-animated-content',
      'duplicated-javascript',
      'legacy-javascript'
    ];

    for (const auditKey of opportunityAudits) {
      if (audits[auditKey] && audits[auditKey].score !== null && audits[auditKey].score < 0.9) {
        const audit = audits[auditKey];
        opportunities.push({
          id: auditKey,
          title: audit.title,
          description: audit.description,
          score: Math.round((audit.score || 0) * 100),
          displayValue: audit.displayValue,
          details: audit.details
        });
      }
    }

    return opportunities.sort((a, b) => a.score - b.score);
  }

  private extractDiagnostics(audits: any): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    
    const diagnosticAudits = [
      'font-display',
      'tap-targets',
      'document-title',
      'html-has-lang',
      'meta-description',
      'http-status-code',
      'link-text',
      'crawlable-anchors',
      'is-crawlable',
      'robots-txt'
    ];

    for (const auditKey of diagnosticAudits) {
      if (audits[auditKey] && audits[auditKey].score !== null && audits[auditKey].score < 1) {
        const audit = audits[auditKey];
        diagnostics.push({
          id: auditKey,
          title: audit.title,
          description: audit.description,
          score: Math.round((audit.score || 0) * 100),
          displayValue: audit.displayValue,
          details: audit.details
        });
      }
    }

    return diagnostics;
  }
}