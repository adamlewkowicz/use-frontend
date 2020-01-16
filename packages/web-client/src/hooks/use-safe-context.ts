import { Context, useContext } from 'react'

export const useSafeContext = <T>(context: Context<T>): T => {
  const contextValue = useContext(context);

  if (contextValue === null || contextValue === undefined) {
    throw new Error(
      `No provider has been passed for "${context.displayName}" context.`
    );
  }

  return contextValue;
}