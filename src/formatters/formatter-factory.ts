import { BaseFormatter } from './base.formatter';
import { MarkdownFormatter } from './markdown/markdown.formatter';
import { TextFormatter } from './text/text.formatter';
import { JsonFormatter } from './json/json.formatter';

export class FormatterFactory {
  static create(format: string = 'md'): BaseFormatter {
    switch (format) {
      case 'md':
      case 'markdown':
        return new MarkdownFormatter();
      case 'txt':
      case 'text':
        return new TextFormatter();
      case 'json':
        return new JsonFormatter();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}