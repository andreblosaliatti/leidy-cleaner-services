import { apiBaseUrl } from '../lib/env';

type ApiEnvelope<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      code: string;
      message: string;
      errors: string[];
    };

type ApiRequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors: string[];

  constructor({ status, code, message, errors = [] }: { status: number; code?: string; message: string; errors?: string[] }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, body, ...init } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set('Accept', 'application/json');

  if (body && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    body,
    headers: requestHeaders,
  });

  const parsedBody = await parseJsonResponse<T>(response);

  if (!response.ok) {
    throw buildApiError(response.status, parsedBody);
  }

  if (isApiEnvelope(parsedBody)) {
    if (parsedBody.success) {
      return parsedBody.data;
    }

    throw new ApiError({
      status: response.status,
      code: parsedBody.code,
      message: parsedBody.message,
      errors: parsedBody.errors,
    });
  }

  return parsedBody as T;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível concluir a operação.';
}

async function parseJsonResponse<T>(response: Response): Promise<ApiEnvelope<T> | T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as ApiEnvelope<T> | T;
  } catch {
    return null;
  }
}

function buildApiError<T>(status: number, body: ApiEnvelope<T> | T | null): ApiError {
  if (isApiEnvelope(body) && !body.success) {
    return new ApiError({
      status,
      code: body.code,
      message: body.message,
      errors: body.errors,
    });
  }

  return new ApiError({
    status,
    message: status === 401 ? 'Sessão expirada. Entre novamente.' : 'Não foi possível concluir a operação.',
  });
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return Boolean(value && typeof value === 'object' && 'success' in value);
}
