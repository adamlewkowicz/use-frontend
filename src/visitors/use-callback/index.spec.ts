import { mountPluginTester } from '../../utils';
import { useCallbackPlugin } from '.';

describe('useCallback Visitor', () => {

  const pluginTester = mountPluginTester(useCallbackPlugin);

  it('should transform useCallback to computed callback', () => {
    const result = pluginTester(
      `const doubledCounterCb = useCallback(() => counter * 3, [counter]);`
    );

    expect(result).toEqual(`const doubledCounterCb = computed(() => () => counter * 3);`);
  });

});