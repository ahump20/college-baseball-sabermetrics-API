export interface ProxyRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface ProxyResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  text?: string;
  error?: string;
}

export class CorsProxyClient {
  private proxyEndpoint: string;
  
  constructor(proxyEndpoint: string = '/api/proxy') {
    this.proxyEndpoint = proxyEndpoint;
  }

  async fetch(options: ProxyRequestOptions): Promise<ProxyResponse> {
    try {
      const response = await fetch(this.proxyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Proxy request failed: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      return {
        ok: false,
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get(url: string, headers?: Record<string, string>): Promise<ProxyResponse> {
    return this.fetch({ url, method: 'GET', headers });
  }

  async getPdf(url: string): Promise<ProxyResponse> {
    return this.fetch({
      url,
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'Mozilla/5.0 (compatible; BSI-Scraper/1.0)',
      },
    });
  }
}

export const corsProxy = new CorsProxyClient();
