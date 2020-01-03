import { useState, useEffect, useRef } from 'react';

export const useWebWorker = <T, E = unknown | null>(WorkerModule: any) => {
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const { current: worker } = useRef<any>(WorkerModule);
  const { postMessage = () => {}, terminate = () => {} } = worker;

  const messageHandler = (event: MessageEvent) => setResult(event.data);

  const errorHandler = (event: ErrorEvent) => setError(event.error);

  useEffect(() => {
    worker.addEventListener('message', messageHandler);
    worker.addEventListener('error', errorHandler);

    return () => {
      terminate();
      worker.removeEventListener('message', messageHandler);
      worker.removeEventListener('error', errorHandler);
    }
  }, []);

  return {
    result,
    error,
    postMessage,
    terminate,
  }
}