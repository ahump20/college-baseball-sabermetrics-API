import { useState, useEffect } from 'react';

export function usePageLoading(initialState = true, delay = 500) {
  const [isLoading, setIsLoading] = useState(initialState);

  useEffect(() => {
    if (initialState) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [initialState, delay]);

  return [isLoading, setIsLoading] as const;
}

export function useAsyncLoading<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    asyncFn()
      .then((result) => {
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, deps);

  return { isLoading, data, error };
}
