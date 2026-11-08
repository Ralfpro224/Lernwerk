/** Client for HTTP operations confirmed in docs/EVIDENCE.md. No credential storage or logging. */

export interface AntonClientOptions {
  fetch?: typeof fetch;
  contentBaseUrl?: string;
  loginBaseUrl?: string;
  loggerBaseUrl?: string;
}

export interface PingResponse {
  status: string;
}

export interface LoginStep1Input {
  /** A login code, email, phone number or username belonging to an authorized account. */
  value: string;
  deviceLogId?: string;
  checkCaptcha?: boolean;
}

export interface LoginStep1Response {
  status: string;
  loginCode?: string;
  logId?: string;
  authToken?: string;
  displayName?: string;
  avatar?: {
    body?: Record<string, unknown>;
    head?: Record<string, unknown>;
    legs?: Record<string, unknown>;
    shadow?: Record<string, unknown>;
    version?: number;
  };
  [key: string]: unknown;
}

export interface SubscribeEventsInput {
  logId: string;
  authToken: string;
  filter: string;
  inserted: string;
  deviceLogId?: string;
}

export interface LoggerSubscribeResponse {
  error?: boolean;
  log?: string;
  inserted?: string;
  filter?: string;
  totalEvents?: number;
  maxInserted?: string;
  events?: Record<string, unknown>[];
  isInSync?: boolean;
  authToken?: string;
  [key: string]: unknown;
}

export class AntonHttpError extends Error {
  constructor(readonly status: number) {
    // Do not include URLs, headers or bodies: they may contain account tokens.
    super(`ANTON request failed with HTTP ${status}`);
    this.name = "AntonHttpError";
  }
}

export class AntonClient {
  private readonly transport: typeof fetch;
  private readonly contentBaseUrl: string;
  private readonly loginBaseUrl: string;
  private readonly loggerBaseUrl: string;

  constructor(options: AntonClientOptions = {}) {
    this.transport = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.contentBaseUrl = options.contentBaseUrl ?? "https://content.anton.app";
    this.loginBaseUrl = options.loginBaseUrl ?? "https://a-apis-db.anton.app";
    this.loggerBaseUrl =
      options.loggerBaseUrl ?? "https://apis-db-logger-s-lb-2.anton.app";
  }

  /** Public GET /ping, observed with a JSON status field. */
  async ping(signal?: AbortSignal): Promise<PingResponse> {
    const response = await this.request(new URL("/ping", this.contentBaseUrl), {
      method: "GET",
      signal,
    });
    return (await response.json()) as PingResponse;
  }

  /** Public GET /files/. The response may be JSON, text or an image. */
  async getFile(fileId: string, signal?: AbortSignal): Promise<Response> {
    const url = new URL("/files/", this.contentBaseUrl);
    url.searchParams.set("fileId", nonempty(fileId, "fileId"));
    return this.request(url, { method: "GET", signal });
  }

  /** Public HEAD /files/. Returns response metadata without a body. */
  async headFile(fileId: string, signal?: AbortSignal): Promise<Headers> {
    const url = new URL("/files/", this.contentBaseUrl);
    url.searchParams.set("fileId", nonempty(fileId, "fileId"));
    const response = await this.request(url, { method: "HEAD", signal });
    return response.headers;
  }

  /** Confirmed login RPC. Other account types may require a second step or CAPTCHA. */
  async loginStep1(
    input: LoginStep1Input,
    signal?: AbortSignal,
  ): Promise<LoginStep1Response> {
    const url = new URL("/", this.loginBaseUrl);
    url.searchParams.set("p", "login/step1/step1");
    const body = {
      params: {
        value: nonempty(input.value, "value"),
        checkCaptcha: input.checkCaptcha ?? true,
      },
      path: "/../server-apis-db2/apis/login/step1/step1",
      ...(input.deviceLogId ? { deviceLogId: input.deviceLogId } : {}),
      isDebug: false,
      useAuthToken: false,
    };
    const response = await this.request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal,
    });
    return (await response.json()) as LoginStep1Response;
  }

  /**
   * Confirmed logger GET. Its observed protocol puts authToken in the URL query.
   * Only call it for an authorized log; never log or persist the resulting URL.
   */
  async subscribeEvents(
    input: SubscribeEventsInput,
    signal?: AbortSignal,
  ): Promise<LoggerSubscribeResponse> {
    const url = new URL("/apisLogger/subscribe/", this.loggerBaseUrl);
    url.searchParams.set("path", "subscribe");
    url.searchParams.set("params[logId]", nonempty(input.logId, "logId"));
    url.searchParams.set("params[filter][name]", nonempty(input.filter, "filter"));
    url.searchParams.set("params[inserted]", nonempty(input.inserted, "inserted"));
    url.searchParams.set("params[readOnly]", "true");
    url.searchParams.set("params[authToken]", nonempty(input.authToken, "authToken"));
    if (input.deviceLogId) url.searchParams.set("deviceLogId", input.deviceLogId);
    const response = await this.request(url, {
      method: "GET",
      cache: "no-store",
      signal,
    });
    return (await response.json()) as LoggerSubscribeResponse;
  }

  private async request(url: URL, init: RequestInit): Promise<Response> {
    const response = await this.transport(url, {
      ...init,
      credentials: "omit",
      redirect: "error",
    });
    if (!response.ok) throw new AntonHttpError(response.status);
    return response;
  }
}

function nonempty(value: string, name: string): string {
  if (!value.trim()) throw new TypeError(`${name} must not be empty`);
  return value;
}
