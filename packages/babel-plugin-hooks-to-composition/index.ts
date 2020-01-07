import { rootVisitor } from './visitors';

export const hooksToCompositionPlugin = () => ({
  name: 'hooks-to-composition',
  visitor: rootVisitor
});