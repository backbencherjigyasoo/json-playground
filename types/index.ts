export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export type AuthType = 'none' | 'bearer' | 'basic';

export interface AuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
}

export interface RequestConfig {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  bodyType: 'none' | 'json' | 'raw';
  bodyContent: string;
  auth: AuthConfig;
  useProxy: boolean;
}

export interface ResponseData {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  headers: Record<string, string>;
  data: any;
  rawBody: string;
  isJson: boolean;
  isProxy?: boolean;
  error?: string;
  errorCategory?: 'cors' | 'network' | 'http' | 'parse' | 'timeout';
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  request: RequestConfig;
  responseSummary?: {
    status: number;
    statusText: string;
    timeMs: number;
    sizeBytes: number;
    isError?: boolean;
  };
  isStarred?: boolean;
}

export interface SavedCollection {
  id: string;
  name: string;
  createdAt: number;
  requests: RequestConfig[];
}

export interface ApiPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  method: HttpMethod;
  url: string;
  headers?: KeyValuePair[];
  bodyContent?: string;
}
