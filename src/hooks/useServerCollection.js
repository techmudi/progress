import { useCallback, useEffect, useMemo, useState } from 'react';
import { cleanQueryParams } from '../utils/queryParams';

const defaultMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
};

export function useServerCollection({
  fetcher,
  initialFilters = {},
  initialSort = 'created_at',
  initialDirection = 'desc',
  initialPerPage = 15,
  debounceMs = 350,
}) {
  const [query, setQuery] = useState({
    ...initialFilters,
    page: 1,
    per_page: initialPerPage,
    sort: initialSort,
    direction: initialDirection,
  });
  const [searchInput, setSearchInput] = useState(initialFilters.search || '');
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim();

      setQuery((current) => {
        if ((current.search || '') === nextSearch) return current;
        return { ...current, search: nextSearch, page: 1 };
      });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, searchInput]);

  const params = useMemo(() => cleanQueryParams(query), [query]);

  useEffect(() => {
    const controller = new AbortController();

    setLoading((current) => current || items.length === 0);
    setRefreshing(items.length > 0);
    setError(null);

    async function loadCollection() {
      try {
        const result = await fetcher(params, controller.signal);

        setItems(result.items || []);
        setMeta({ ...defaultMeta, ...(result.meta || {}) });
        setLinks(result.links || null);
      } catch (caught) {
        if (caught?.type !== 'cancelled') {
          setError(caught);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadCollection();

    return () => controller.abort();
  }, [fetcher, params, refreshToken]);

  const setPage = useCallback((page) => {
    setQuery((current) => ({ ...current, page }));
  }, []);

  const setPerPage = useCallback((perPage) => {
    setQuery((current) => ({ ...current, per_page: perPage, page: 1 }));
  }, []);

  const setFilter = useCallback((name, value) => {
    setQuery((current) => ({ ...current, [name]: value, page: 1 }));
  }, []);

  const setFilters = useCallback((filters) => {
    setQuery((current) => ({ ...current, ...filters, page: 1 }));
  }, []);

  const setSort = useCallback((field) => {
    setQuery((current) => ({
      ...current,
      sort: field,
      direction: current.sort === field && current.direction === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }, []);

  const refresh = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  return {
    items,
    meta,
    links,
    loading,
    refreshing,
    error,
    query,
    params,
    searchInput,
    setSearchInput,
    setPage,
    setPerPage,
    setFilter,
    setFilters,
    setSort,
    refresh,
  };
}
