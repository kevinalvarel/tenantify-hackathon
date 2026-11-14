import { Redis } from "@upstash/redis";

const CUSTOMER_CATALOG_KEY = "tenantify:v1:customer-catalog";
const ASSOCIATION_DATA_KEY = "tenantify:v1:association-data";

export const CUSTOMER_CATALOG_TTL = 60 * 60 * 12;
export const ASSOCIATION_DATA_TTL = 60 * 60;

export const cacheKeys = {
  customerCatalog: CUSTOMER_CATALOG_KEY,
  associationData: ASSOCIATION_DATA_KEY,
};

let client: Redis | null | undefined;

function redis() {
  if (client !== undefined) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;

  return client;
}

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const store = redis();

  if (store) {
    try {
      const hit = await store.get<T>(key);
      if (hit !== null) return hit;
    } catch (error) {
      console.warn(`Redis read failed for ${key}, reading from source:`, error);
    }
  }

  const value = await load();

  if (store) {
    try {
      await store.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.warn(`Redis write failed for ${key}:`, error);
    }
  }

  return value;
}

export async function invalidateTenantData(): Promise<void> {
  const store = redis();
  if (!store) return;

  try {
    await store.del(CUSTOMER_CATALOG_KEY, ASSOCIATION_DATA_KEY);
  } catch (error) {
    console.warn("Redis invalidation failed:", error);
  }
}
