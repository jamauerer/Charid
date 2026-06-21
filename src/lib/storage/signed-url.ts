import type { SupabaseClient } from "@supabase/supabase-js";

export const CHARACTER_PHOTOS_BUCKET = "character-photos";
export const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 3600;
/** Max parallel createSignedUrl calls per batch (audit: 3–5). */
export const SIGNED_URL_BATCH_CONCURRENCY = 4;

export type SignedUrlCache = Map<string, string | null>;

export function createSignedUrlCache(): SignedUrlCache {
  return new Map();
}

export type SignStorageUrlsOptions = {
  bucket?: string;
  expiresIn?: number;
  concurrency?: number;
  cache?: SignedUrlCache;
};

async function signPathOnce(
  supabase: SupabaseClient,
  bucket: string,
  path: string,
  expiresIn: number,
  cache: SignedUrlCache
): Promise<string | null> {
  if (cache.has(path)) {
    return cache.get(path) ?? null;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.warn(
      `Signed URL failed for storage path "${path}": ${error.message}`
    );
    cache.set(path, null);
    return null;
  }

  cache.set(path, data.signedUrl);
  return data.signedUrl;
}

export async function signStorageUrls(
  supabase: SupabaseClient,
  paths: Iterable<string | null | undefined>,
  options: SignStorageUrlsOptions = {}
): Promise<SignedUrlCache> {
  const bucket = options.bucket ?? CHARACTER_PHOTOS_BUCKET;
  const expiresIn = options.expiresIn ?? DEFAULT_SIGNED_URL_EXPIRY_SECONDS;
  const concurrency = options.concurrency ?? SIGNED_URL_BATCH_CONCURRENCY;
  const cache = options.cache ?? createSignedUrlCache();

  const uniquePaths = [
    ...new Set(
      [...paths].filter(
        (path): path is string => typeof path === "string" && path.length > 0
      )
    ),
  ].filter((path) => !cache.has(path));

  for (let i = 0; i < uniquePaths.length; i += concurrency) {
    const batch = uniquePaths.slice(i, i + concurrency);
    await Promise.all(
      batch.map((path) =>
        signPathOnce(supabase, bucket, path, expiresIn, cache)
      )
    );
  }

  return cache;
}

export function lookupSignedUrl(
  cache: SignedUrlCache,
  path: string | null | undefined
): string | null {
  if (!path) {
    return null;
  }
  if (!cache.has(path)) {
    return null;
  }
  return cache.get(path) ?? null;
}

export async function getSignedStorageUrl(
  supabase: SupabaseClient,
  path: string | null | undefined,
  options: SignStorageUrlsOptions = {}
): Promise<string | null> {
  if (!path) {
    return null;
  }
  const cache = options.cache ?? createSignedUrlCache();
  await signStorageUrls(supabase, [path], { ...options, cache });
  return lookupSignedUrl(cache, path);
}

export async function attachSignedUrls<TItem, TResult>(
  supabase: SupabaseClient,
  items: TItem[],
  getPath: (item: TItem) => string | null | undefined,
  mapItem: (item: TItem, url: string | null) => TResult,
  options: SignStorageUrlsOptions = {}
): Promise<TResult[]> {
  const cache = options.cache ?? createSignedUrlCache();
  await signStorageUrls(
    supabase,
    items.map(getPath),
    { ...options, cache }
  );
  return items.map((item) =>
    mapItem(item, lookupSignedUrl(cache, getPath(item)))
  );
}
