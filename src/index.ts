import '@colors/colors';
import { Color } from '@colors/colors';

type LogModes = 'info' | 'debug' | 'error';
type LogTypes = 'all' | 'fetch' | 'image' | 'js' | 'css' | 'html' | 'unknown';
type Columns =
  | 'requestType'
  | 'responseStatus'
  | 'duration'
  | 'url'
  | 'responseSize'
  | 'filename'
  | 'timestamp';
type URLOptions = {
  host?: boolean;
  pathname?: 'full' | 'short';
  search?: boolean;
};

type LoggerType = {
  mode?: LogModes;
  type?: LogTypes;
  columns?: Columns[];
  urlOptions?: URLOptions;
};

type Fetch = typeof global.fetch & { type?: 'rsc-logger' | undefined };

class RSC_LOGGER {
  private static instance: RSC_LOGGER;
  private readonly _fetch = global.fetch;

  private mode: LogModes = 'info';
  private type: LogTypes = 'all';
  private columns: Columns[] | undefined;
  private urlOptions: URLOptions = {
    host: true,
    pathname: 'short',
    search: true,
  };

  private constructor({ mode, type, columns, urlOptions }: LoggerType = {}) {
    if (mode) this.mode = mode;
    if (type) this.type = type;
    if (columns) this.columns = columns;
    if (urlOptions) this.urlOptions = urlOptions;
  }

  public static init(config: LoggerType = {}): RSC_LOGGER {
    if (!RSC_LOGGER.instance) {
      RSC_LOGGER.instance = new RSC_LOGGER(config);
    }

    return RSC_LOGGER.instance;
  }

  public attachLogger(): void {
    if (!this.isServer || this.isLoggerAttached) return;

    // @ts-ignore
    global.fetch = async (input: RequestInfo | URL, ...rest): Promise<Response> => {
      const startTime = performance.now();
      const response = await this._fetch(input, ...rest);
      const endTime = performance.now();

      const clonedResponse = response.clone();

      this.logRequest(input, startTime, endTime, clonedResponse);

      return response;
    };

    (global.fetch as Fetch).type = 'rsc-logger';
  }

  removeLogger(): void {
    if (!this.isServer || !this.isLoggerAttached) return;
    global.fetch = this._fetch;
  }

  public static setMode(mode: LogModes): void {
    RSC_LOGGER.instance.mode = mode;
  }

  get isServer(): boolean {
    return typeof global?.fetch !== 'undefined' && typeof window === 'undefined';
  }

  get isLoggerAttached(): boolean {
    return (global.fetch as Fetch).type === 'rsc-logger';
  }

  logRequest(input: RequestInfo | URL, startTime: number, endTime: number, res: Response): void {
    if (!this.isServer || !this.isLoggerAttached) return;

    const requestType = this.getRequestType(res);
    if (this.type !== 'all' && this.type !== requestType) return;

    const duration = endTime - startTime;

    switch (this.mode) {
      case 'info':
        this.logInfo(res, duration, input);
        break;
      case 'debug':
        this.logDebug(res, duration, input);
        break;
      case 'error':
        this.logError(res, duration, input);
        break;
      default:
        this.logInfo(res, duration, input);
        break;
    }
  }

  logInfo = async (res: Response, duration: number, input: RequestInfo | URL): Promise<void> => {
    const infoColumns: Columns[] = [
      'requestType',
      'responseStatus',
      'duration',
      'url',
      'responseSize',
    ];

    const message = await this.createMessage(this.columns || infoColumns, input, duration, res);

    // eslint-disable-next-line no-console
    console.log(message);
  };

  logDebug = async (res: Response, duration: number, input: RequestInfo | URL): Promise<void> => {
    const debugColumns: Columns[] = [
      'requestType',
      'responseStatus',
      'duration',
      'url',
      'filename',
      'timestamp',
    ];

    const message = await this.createMessage(this.columns || debugColumns, input, duration, res);

    // eslint-disable-next-line no-console
    console.log(message);
  };

  logError = async (res: Response, duration: number, input: RequestInfo | URL): Promise<void> => {
    if (res.ok) return;
    this.logDebug(res, duration, input);
  };

  createMessage = async (
    columns: Columns[],
    input: RequestInfo | URL,
    duration: number,
    res: Response,
  ): Promise<string> => {
    let message = '';

    if (columns.includes('requestType')) {
      const requestType = this.getRequestType(res);
      const requestTypeColor = this.getRequestTypeColor(requestType, res.ok);
      // @ts-ignore
      message += `${requestType.toUpperCase()}`[requestTypeColor].bold;
    }
    if (columns.includes('responseStatus')) {
      const responseColor = this.getResponseColor(res);
      message += ` - ${res.status}`[responseColor];
    }
    if (columns.includes('duration')) {
      const durationColor = this.getDurationColor(duration);
      // @ts-ignore
      message += ` - ${this.formatDuration(duration)}`[durationColor].italic;
    }
    if (columns.includes('url')) {
      message += ` - ${this.formatUrl(input, this.urlOptions)}`;
    }
    if (columns.includes('responseSize')) {
      const responseSize = await this.getResponseSize(res);
      message += ` - ${responseSize}`.gray;
    }

    if (columns.includes('filename')) {
      const filenameParts = __filename.split('\\').slice(-4).join('/');
      message += ` - ${filenameParts}`.gray.underline;
    }
    if (columns.includes('timestamp')) {
      // get a timestamp in the format of DD:MM:YYYY HH:MM:SS
      const timestamp = new Date().toLocaleString().replace(',', '');
      message += ` - ${timestamp}`.gray;
    }

    return message;
  };

  getRequestTypeColor = (requestType: string, ok: boolean): keyof Color => {
    let requestTypeColor: 'red' | 'green' | 'cyan' | 'yellow' | 'gray';
    if (!ok) requestTypeColor = 'red';
    else if (requestType === 'fetch') requestTypeColor = 'green';
    else if (requestType === 'image') requestTypeColor = 'cyan';
    else if (requestType === 'html') requestTypeColor = 'yellow';
    else if (requestType === 'css') requestTypeColor = 'yellow';
    else if (requestType === 'js') requestTypeColor = 'yellow';
    else requestTypeColor = 'gray';

    return requestTypeColor;
  };

  getResponseColor = (res: Response): keyof Color => {
    let requestColor: 'red' | 'green';
    if (res.ok) requestColor = 'green';
    else requestColor = 'red';
    return requestColor;
  };

  getDurationColor = (duration: number): keyof Color => {
    let durationColor: 'red' | 'green' | 'yellow';
    if (duration < 50) durationColor = 'green';
    else if (duration < 100) durationColor = 'yellow';
    else durationColor = 'red';
    return durationColor;
  };

  formatDuration = (duration: number): string => {
    return duration.toFixed() + 'ms';
  };

  formatUrl = (input: RequestInfo | URL, options: URLOptions): string => {
    const { host, pathname, search } = options;
    const url = new URL(input.toString());

    let formattedUrl = '';
    if (host) formattedUrl += url.host.gray.underline;
    if (pathname === 'full') formattedUrl += url.pathname.cyan;
    else formattedUrl += '/'.cyan + url.pathname.split('/').slice(-1).join('/').cyan;
    if (search) formattedUrl += url.search.gray;

    return formattedUrl;
  };

  getResponseSize = async (res: Response): Promise<string> => {
    try {
      const contentLength = res.headers.get('content-length');
      if (contentLength) {
        const sizeInBytes = parseInt(contentLength, 10);
        const sizeInKB = sizeInBytes / 1024; // Convert bytes to kilobytes
        return sizeInKB.toFixed(2) + ' KB';
      } else {
        // Note: This approach might not work for large streamed responses as the entire body needs to be loaded
        const blob = await res.blob();
        const sizeInBytes = blob.size;
        const sizeInKB = sizeInBytes / 1024; // Convert bytes to kilobytes
        return sizeInKB.toFixed(2) + ' KB';
      }
    } catch (error) {
      return '';
    }
  };

  getRequestType = (res: Response): string => {
    const contentType = res.headers.get('content-type');
    const url = res.url;

    if (contentType?.includes('application/javascript') || url.endsWith('.js')) {
      return 'js';
    } else if (contentType?.includes('text/css') || url.endsWith('.css')) {
      return 'css';
    } else if (
      contentType?.includes('image') ||
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.gif') ||
      url.endsWith('.svg') ||
      url.endsWith('.webp') ||
      url.endsWith('.avif')
    ) {
      return 'image';
    } else if (
      contentType?.includes('text/html') ||
      url.endsWith('.html') ||
      url.endsWith('.htm')
    ) {
      return 'html';
    } else if (contentType?.includes('application/json') || url.endsWith('.json')) {
      return 'fetch';
    } else if (contentType?.includes('text/plain') || url.endsWith('.txt')) {
      return 'fetch';
    } else {
      return 'unknown';
    }
  };
}

export default RSC_LOGGER;
