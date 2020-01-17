import { useRef, useEffect, DependencyList, EffectCallback } from 'react'

/** Same as useEffect, but skips on first run. */
export const useMountedEffect = (
  callback: EffectCallback,
  dependencies?: DependencyList,
): void => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      callback();
    } else {
      isMounted.current = true;
    }
  }, dependencies);

}