#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { AnalyzeCommand } from './commands/analyze';
import { version } from '../../package.json';

const program = new Command();

program
  .name('dev-lamp')
  .description(chalk.yellow('Your friendly lighthouse performance companion'))
  .version(version)
  .option('-c, --config <path>', 'config file path')
  .option('--no-emoji', 'disable emojis in output');

// Main analyze command (default)
program
  .command('analyze <url>', { isDefault: true })
  .alias('a')
  .description('Analyze a URL and generate report')
  .option('-o, --output <path>', 'output file path', 'lighthouse-report.md')
  .option('-f, --format <type>', 'output format (md|txt|json)', 'md')
  .option('-t, --template <name>', 'template (minimal|detailed|github)', 'detailed')
  .option('--device <type>', 'device type (mobile|desktop)', 'desktop')
  .option('--categories <list>', 'categories to audit', 'performance')
  .option('--threshold <score>', 'minimum acceptable score', parseInt)
  .option('--no-headless', 'show Chrome window')
  .option('--keep-alive', 'keep Chrome open for multiple runs')
  .action(async (url, options) => {
    try {
      const command = new AnalyzeCommand();
      await command.execute(url, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

// Fun lamp metaphor command
program
  .command('wish <url>')
  .alias('rub')
  .description('Make a performance insights request')
  .option('-o, --output <path>', 'where to manifest your wish')
  .action(async (url, options) => {
    console.log(chalk.yellow('Analyzing performance...'));
    try {
      const command = new AnalyzeCommand();
      await command.execute(url, { ...options, fun: true });
    } catch (error) {
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

program.parse();