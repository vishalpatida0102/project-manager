import { useCallback, useEffect, useRef, useState } from 'react';

export default function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ loading: immediate, error: null, data: null });
  const mounted = useRef(true);

  const run = useCallback(async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn(...args);
      if (mounted.current) setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      if (mounted.current) setState({ loading: false, error, data: null });
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    if (immediate) run().catch(() => {});
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { ...state, run, refetch: run, setData: (d) => setState((s) => ({ ...s, data: d })) };
}
