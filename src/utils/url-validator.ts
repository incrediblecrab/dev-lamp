export class UrlValidator {
  private static readonly ALLOWED_PROTOCOLS = ['http:', 'https:'];
  private static readonly MAX_URL_LENGTH = 2048;
  private static readonly DANGEROUS_PATTERNS = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /about:/i,
    /chrome:/i,
    /chrome-extension:/i
  ];

  static validate(urlString: string): { valid: boolean; error?: string; sanitized?: string } {
    // Check URL length
    if (!urlString || urlString.length === 0) {
      return { valid: false, error: 'URL is required' };
    }

    if (urlString.length > this.MAX_URL_LENGTH) {
      return { valid: false, error: `URL exceeds maximum length of ${this.MAX_URL_LENGTH} characters` };
    }

    // Trim whitespace
    const trimmedUrl = urlString.trim();

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(trimmedUrl)) {
        return { valid: false, error: 'URL contains potentially dangerous protocol' };
      }
    }

    try {
      const url = new URL(trimmedUrl);

      // Check protocol
      if (!this.ALLOWED_PROTOCOLS.includes(url.protocol)) {
        return { 
          valid: false, 
          error: `Invalid protocol. Only ${this.ALLOWED_PROTOCOLS.join(', ')} are allowed` 
        };
      }

      // Check for local file paths disguised as URLs
      if (url.pathname.includes('../') || url.pathname.includes('..\\')) {
        return { valid: false, error: 'URL contains path traversal patterns' };
      }

      // Check hostname
      if (!url.hostname || url.hostname.length === 0) {
        return { valid: false, error: 'URL must have a valid hostname' };
      }

      // Validate hostname format
      const hostnameRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)*[a-z0-9]+(-[a-z0-9]+)*$|^localhost$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$|^\[[\da-fA-F:]+\]$/i;
      if (!hostnameRegex.test(url.hostname)) {
        return { valid: false, error: 'Invalid hostname format' };
      }

      // Check port if specified
      if (url.port) {
        const port = parseInt(url.port, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
          return { valid: false, error: 'Invalid port number (must be 1-65535)' };
        }
      }

      // Return sanitized URL
      return { 
        valid: true, 
        sanitized: url.toString()
      };

    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  static isLocalUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      const localPatterns = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
        '[::1]'
      ];
      
      return localPatterns.includes(url.hostname) || 
             url.hostname.endsWith('.local') ||
             /^192\.168\.\d{1,3}\.\d{1,3}$/.test(url.hostname) ||
             /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url.hostname) ||
             /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(url.hostname);
    } catch {
      return false;
    }
  }
}