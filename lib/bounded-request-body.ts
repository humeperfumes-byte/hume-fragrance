export async function readBoundedJson(request: Request, maximumBytes: number): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing request body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const result = await reader.read(); if (result.done) break;
      length += result.value.byteLength;
      if (length > maximumBytes) { await reader.cancel(); throw new Error("Request too large"); }
      chunks.push(result.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
