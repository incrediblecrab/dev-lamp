import * as chromeLauncher from 'chrome-launcher';
import type { ChromeConfig } from '../types/config';

export class ChromeManager {
  private static instance: ChromeManager;
  private chromeInstance: chromeLauncher.LaunchedChrome | null = null;
  private useCount = 0;

  private constructor() {}

  static getInstance(): ChromeManager {
    if (!ChromeManager.instance) {
      ChromeManager.instance = new ChromeManager();
    }
    return ChromeManager.instance;
  }

  async getChrome(options: ChromeConfig = {}): Promise<chromeLauncher.LaunchedChrome> {
    if (!this.chromeInstance) {
      this.chromeInstance = await this.launchChrome(options);
    }
    this.useCount++;
    return this.chromeInstance;
  }

  private async launchChrome(options: ChromeConfig): Promise<chromeLauncher.LaunchedChrome> {
    const flags: string[] = [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-extensions-with-background-pages',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-default-browser-check',
      '--mute-audio',
      '--autoplay-policy=no-user-gesture-required',
      '--disable-blink-features=AutomationControlled'
    ];

    if (options.headless !== false) {
      flags.push('--headless=new');
    }

    try {
      return await chromeLauncher.launch({
        chromeFlags: flags,
        chromePath: options.chromePath,
        port: options.port
      });
    } catch (error: any) {
      if (error.code === 'ENOENT' || error.message?.includes('No Chrome installations found')) {
        const chromeNotFoundError: any = new Error('Chrome browser not found');
        chromeNotFoundError.code = 'CHROME_NOT_FOUND';
        throw chromeNotFoundError;
      }
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    this.useCount--;
    if (this.useCount <= 0 && this.chromeInstance) {
      await this.chromeInstance.kill();
      this.chromeInstance = null;
      this.useCount = 0;
    }
  }

  async forceCleanup(): Promise<void> {
    if (this.chromeInstance) {
      await this.chromeInstance.kill();
      this.chromeInstance = null;
      this.useCount = 0;
    }
  }
}