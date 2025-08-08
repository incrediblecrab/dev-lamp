import { writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { mkdir } from 'fs/promises';
import { PathSanitizer } from './path-sanitizer';

export class FileWriter {
  async write(content: string, outputPath: string): Promise<string> {
    // Sanitize the output path
    const sanitization = PathSanitizer.sanitizeOutputPath(outputPath);
    
    if (!sanitization.safe) {
      throw new Error(`Invalid output path: ${sanitization.error}`);
    }
    
    const safePath = sanitization.sanitized || outputPath;
    const absolutePath = resolve(safePath);
    
    // Ensure directory exists
    const dir = dirname(absolutePath);
    await mkdir(dir, { recursive: true });
    
    // Validate content
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content to write');
    }
    
    // Limit file size to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (content.length > maxSize) {
      throw new Error(`Content exceeds maximum size of ${maxSize} bytes`);
    }
    
    // Write file
    await writeFile(absolutePath, content, 'utf-8');
    
    return absolutePath;
  }
}