import { useState, useEffect } from 'react';

export const useLocalStorage = <T extends object>(
  initialState: T,
  storeKey: string = 'use_ls'
) => {
  const [storage, setStorage] = useState<T>({
    ...initialState,
    ...localStorage as T,
  });

  const update = (payload: Partial<T>) => setStorage(s => ({ ...s, ...payload }));

  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify(storage));
  }, [storage]);

  return { storage, update };
}