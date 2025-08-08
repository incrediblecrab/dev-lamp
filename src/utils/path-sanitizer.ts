import { basename, resolve, normalize, isAbsolute } from 'path';

export class PathSanitizer {
  private static readonly DANGEROUS_PATTERNS = [
    /\.\./g,           // Parent directory traversal
    /~\//g,            // Home directory access
    /^\//,             // Absolute paths (on Unix)
    /^[A-Z]:\\/i,      // Absolute paths (on Windows)
    /\0/g,             // Null bytes
    /<|>|:|"|\\|\||\?|\*/g  // Invalid filename characters
  ];

  private static readonly MAX_PATH_LENGTH = 255;
  private static readonly SAFE_EXTENSIONS = ['.md', '.txt', '.json', '.html'];

  static sanitizeOutputPath(path: string): { safe: boolean; sanitized?: string; error?: string } {
    if (!path || path.length === 0) {
      return { safe: false, error: 'Output path is required' };
    }

    // Check length
    if (path.length > this.MAX_PATH_LENGTH) {
      return { safe: false, error: `Path exceeds maximum length of ${this.MAX_PATH_LENGTH} characters` };
    }

    // Normalize the path
    let normalizedPath = normalize(path);

    // Reject absolute paths
    if (isAbsolute(normalizedPath)) {
      // Convert to relative path in current directory
      normalizedPath = basename(normalizedPath);
    }

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(normalizedPath)) {
        return { safe: false, error: 'Path contains invalid or dangerous characters' };
      }
    }

    // Check for path traversal attempts
    if (normalizedPath.includes('..') || normalizedPath.includes('./')) {
      return { safe: false, error: 'Path traversal attempts are not allowed' };
    }

    // Ensure safe extension
    const hasValidExtension = this.SAFE_EXTENSIONS.some(ext => 
      normalizedPath.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      // Add default extension if none provided
      if (!normalizedPath.includes('.')) {
        normalizedPath += '.md';
      } else {
        return { safe: false, error: 'Invalid file extension. Allowed: ' + this.SAFE_EXTENSIONS.join(', ') };
      }
    }

    // Resolve to safe path
    const safePath = resolve(process.cwd(), normalizedPath);

    // Final check: ensure the resolved path is within current directory
    if (!safePath.startsWith(process.cwd())) {
      return { safe: false, error: 'Output path must be within current directory' };
    }

    return { safe: true, sanitized: normalizedPath };
  }

  static sanitizeFilename(filename: string): string {
    // Remove any directory separators
    let safe = basename(filename);
    
    // Remove dangerous characters
    safe = safe.replace(/[<>:"|?*\\/]/g, '-');
    
    // Remove control characters
    safe = safe.replace(/[\x00-\x1f\x7f]/g, '');
    
    // Limit length
    if (safe.length > 200) {
      const ext = safe.lastIndexOf('.');
      if (ext > 0) {
        const name = safe.substring(0, ext);
        const extension = safe.substring(ext);
        safe = name.substring(0, 200 - extension.length) + extension;
      } else {
        safe = safe.substring(0, 200);
      }
    }
    
    return safe || 'report';
  }
}