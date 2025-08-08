import { BaseFormatter } from '../base.formatter';
import type { LampReport, FormatterOptions } from '../../types/report';

export class JsonFormatter extends BaseFormatter {
  async format(report: LampReport, _options: FormatterOptions): Promise<string> {
    return JSON.stringify(report, null, 2);
  }
}