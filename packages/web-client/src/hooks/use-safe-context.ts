import { Context, useContext } from 'react'

/** Type-safe alternative for *useContext* that throws error if context value is *null* or *undefined*. */
export const useSafeContext = <T>(context: Context<T | null>): T => {
  const contextValue = useContext(context);

  if (contextValue === null || contextValue === undefined) {
    throw new Error(
      `No provider has been passed for "${context.displayName}" context.`
    );
  }

  return contextValue as T;
}