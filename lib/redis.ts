import { Redis } from '@upstash/redis';

// Simple in-memory fallback cache to allow offline development
const localCache = new Map<string, { value: any; expiresAt: number }>();

const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN
);

let redisClient: Redis | null = null;

if (isRedisConfigured) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (err) {
    console.error('Failed to initialize Upstash Redis Client:', err);
  }
} else {
  console.warn('Upstash Redis environment variables missing. Falling back to memory-cache.');
}

/**
 * Enterprise Caching Helper with Upstash-to-Memory Fallbacks
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  // If Redis is configured, use it
  if (redisClient) {
    try {
      const data = await redisClient.get<T>(key);
      return data;
    } catch (err) {
      console.warn(`Redis GET failed for key "${key}":`, err);
    }
  }

  // Fallback to local memory cache
  const localVal = localCache.get(key);
  if (localVal) {
    if (Date.now() < localVal.expiresAt) {
      return localVal.value as T;
    }
    // Evict expired entry
    localCache.delete(key);
  }

  return null;
}

/**
 * Cache writer with TTL (Time To Live) support
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttlSeconds: number = 3600
): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.set(key, data, { ex: ttlSeconds });
      return;
    } catch (err) {
      console.warn(`Redis SET failed for key "${key}":`, err);
    }
  }

  // Memory fallback
  localCache.set(key, {
    value: data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Evict cache records
 */
export async function invalidateCache(key: string): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (err) {
      console.warn(`Redis DEL failed for key "${key}":`, err);
    }
  }

  localCache.delete(key);
}
