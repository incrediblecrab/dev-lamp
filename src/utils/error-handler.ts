import chalk from 'chalk';

export class ErrorHandler {
  handle(error: any): void {
    if (error.code === 'ECONNREFUSED') {
      this.showConnectionError(error);
    } else if (error.code === 'CHROME_NOT_FOUND') {
      this.showChromeError();
    } else if (error.code === 'INVALID_URL') {
      this.showUrlError(error);
    } else if (error.name === 'LighthouseError') {
      this.showLighthouseError(error);
    } else {
      this.showGenericError(error);
    }
  }

  private showConnectionError(error: any): void {
    console.error(chalk.red('\nERROR: Connection Failed\n'));
    console.error('Could not connect to the URL. Please check:');
    console.error('  1. Is your local server running?');
    console.error('  2. Is the URL correct?');
    console.error('  3. Try: ' + chalk.cyan('npm run dev') + ' first\n');
    if (error.url) {
      console.error(chalk.gray(`URL attempted: ${error.url}`));
    }
  }

  private showChromeError(): void {
    console.error(chalk.red('\nERROR: Chrome Not Found\n'));
    console.error('dev-lamp needs Chrome to run Lighthouse audits.\n');
    console.error('Please either:');
    console.error('  1. Install Google Chrome from https://google.com/chrome');
    console.error('  2. Specify Chrome path: ' + chalk.cyan('dev-lamp analyze <url> --chrome-path "/path/to/chrome"'));
    console.error('\nCommon Chrome locations:');
    console.error('  macOS: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    console.error('  Windows: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
    console.error('  Linux: /usr/bin/google-chrome');
  }

  private showUrlError(error: any): void {
    console.error(chalk.red('\nERROR: Invalid URL\n'));
    console.error(`The URL "${error.url}" is not valid.\n`);
    console.error('Valid URL examples:');
    console.error('  ' + chalk.green('http://localhost:3000'));
    console.error('  ' + chalk.green('http://127.0.0.1:8080'));
    console.error('  ' + chalk.green('https://example.com'));
  }

  private showLighthouseError(error: any): void {
    console.error(chalk.red('\nERROR: Lighthouse Error\n'));
    console.error('Failed to run Lighthouse audit:');
    console.error(error.message);
    console.error('\nPossible solutions:');
    console.error('  1. Check if the URL is accessible');
    console.error('  2. Try running with --no-headless to see Chrome');
    console.error('  3. Check Chrome installation');
  }

  private showGenericError(error: any): void {
    console.error(chalk.red('\nERROR: Unexpected Error\n'));
    console.error(error.message || error);
    if (error.stack && process.env.DEBUG) {
      console.error(chalk.gray('\nStack trace:'));
      console.error(chalk.gray(error.stack));
    }
  }
}