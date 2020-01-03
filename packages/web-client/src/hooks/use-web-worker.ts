import { useState, useEffect, useRef } from 'react';

export const useWebWorker = <T, E>(moduleUrl: string) => {
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const worker = useRef(new Worker(moduleUrl));

  const messageHandler = (event: MessageEvent) => setResult(event.data);

  const errorHandler = (event: ErrorEvent) => setError(event.error);

  const sendMessage = worker.current.postMessage;

  useEffect(() => {
    worker.current.addEventListener('message', messageHandler);
    worker.current.addEventListener('error', errorHandler);

    return () => {
      worker.current.removeEventListener('message', messageHandler);
      worker.current.removeEventListener('error', errorHandler);
    }
  }, []);

  return {
    result,
    error,
    sendMessage,
  }
}