import { useState, useCallback, useRef } from "react";
import { apiRequest, ApiError } from "../api/client";
import type { PaginatedResponse } from "../api/types";

interface UsePaginatedListOptions {
  limit?: number;
}

interface UsePaginatedListResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  load: (path: string, params?: Record<string, string>) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function usePaginatedList<T>(
  opts: UsePaginatedListOptions = {}
): UsePaginatedListResult<T> {
  const { limit = 50 } = opts;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);
  const pathRef = useRef<string>("");
  const paramsRef = useRef<Record<string, string>>({});

  const doFetch = useCallback(
    async (path: string, cursor: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({ limit: String(limit) });
        if (cursor) query.set("start_after", cursor);
        for (const [k, v] of Object.entries<string>(paramsRef.current)) {
          query.set(k, v);
        }
        const data = await apiRequest<PaginatedResponse<T>>(
          `${path}?${query.toString()}`
        );
        return data;
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.detail : (err as Error).message;
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const load = useCallback(
    async (path: string, params?: Record<string, string>) => {
      pathRef.current = path;
      paramsRef.current = params || {};
      cursorRef.current = null;
      const data = await doFetch(path, null);
      if (data) {
        setItems(data.items);
        cursorRef.current = data.next_cursor;
        setHasMore(data.next_cursor != null);
      }
    },
    [doFetch]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !cursorRef.current) return;
    const data = await doFetch(pathRef.current, cursorRef.current);
    if (data) {
      setItems((prev) => [...prev, ...data.items]);
      cursorRef.current = data.next_cursor;
      setHasMore(data.next_cursor != null);
    }
  }, [hasMore, loading, doFetch]);

  const reset = useCallback(() => {
    setItems([]);
    setError(null);
    setHasMore(true);
    cursorRef.current = null;
  }, []);

  return { items, loading, error, hasMore, load, loadMore, reset };
}
