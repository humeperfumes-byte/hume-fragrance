/** Bound both the HTTP request and response body, including an unresponsive server. */
export async function checkoutFetch(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(input, { ...init, signal: controller.signal });
        const body = await response.text();
        return new Response([204, 205, 304].includes(response.status) ? null : body, { status: response.status, statusText: response.statusText, headers: response.headers });
      })(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error("Checkout took too long. Your saved order may already exist. Reopen this checkout to check its payment before retrying."));
          controller.abort();
        }, timeoutMs);
      }),
    ]);
  } finally { if (timer) clearTimeout(timer); }
}
