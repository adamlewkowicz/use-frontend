import { testVisitors } from '../../utils';
import { useCallbackVisitors } from '../use-callback';

describe('useCallback Visitor', () => {

  const pluginTester = testVisitors(...useCallbackVisitors);

  it('should transform useCallback to computed callback', () => {
    const result = pluginTester(
      `const doubledCounterCb = useCallback(() => counter * 3, [counter]);`
    );

    expect(result).toEqual(`const doubledCounterCb = computed(() => () => counter * 3);`);
  });

});