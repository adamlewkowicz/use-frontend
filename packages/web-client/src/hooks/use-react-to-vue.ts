import { useBabel } from './use-babel';
import { hooksToCompositionPlugin } from 'babel-plugin-hooks-to-composition';

export const useReactToVue = () => {
  const {
    transform: transformReactCode,
    error: vueError,
    code: vueCode,
  } = useBabel([hooksToCompositionPlugin]);

  return {
    transformReactCode,
    vueCode,
    vueError,
  }
}