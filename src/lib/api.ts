type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOpts {
  path: string;
  method?: Method;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function apiUrl(path: string, query?: ApiOpts["query"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function api<T = unknown>({ path, method = "GET", query, body }: ApiOpts): Promise<T> {
  const res = await fetch(apiUrl(path, query), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined && method !== "GET" ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      data?.error ?? data?.message ?? `Request failed (${res.status})`,
      res.status,
    );
  }
  return data as T;
}
