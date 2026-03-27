import type { PerfumeData } from "@/data/perfumes";

const CACHE_KEY = "hume:products:public:v1";
const CACHE_TTL_MS = 10 * 60 * 1000;

let memoryCache: PerfumeData[] | null = null;
let memoryCacheAt = 0;
let pendingRequest: Promise<PerfumeData[]> | null = null;

type CachedPayload = {
  data: PerfumeData[];
  ts: number;
};

function isFresh(ts: number) {
  return Date.now() - ts < CACHE_TTL_MS;
}

function readSessionCache(): PerfumeData[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed || !Array.isArray(parsed.data) || typeof parsed.ts !== "number") {
      return null;
    }
    if (!isFresh(parsed.ts)) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeSessionCache(data: PerfumeData[]) {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedPayload = { data, ts: Date.now() };
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors; memory cache still works.
  }
}

export async function getClientCachedProducts(): Promise<PerfumeData[]> {
  if (memoryCache && isFresh(memoryCacheAt)) return memoryCache;

  const sessionData = readSessionCache();
  if (sessionData) {
    memoryCache = sessionData;
    memoryCacheAt = Date.now();
    return sessionData;
  }

  if (pendingRequest) return pendingRequest;

  pendingRequest = fetch("/api/products")
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
      const json = (await res.json()) as PerfumeData[];
      const products = Array.isArray(json) ? json : [];
      memoryCache = products;
      memoryCacheAt = Date.now();
      writeSessionCache(products);
      return products;
    })
    .catch(() => [])
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

