import { mountPluginTester } from '../../utils';
import { useMemoPlugin } from '../use-memo';

describe('useMemo Visitor', () => {

  const pluginTester = mountPluginTester(useMemoPlugin);

  it('should transform useMemo to computed', () => {
    const result = pluginTester(
      `const doubledCounter = useMemo(() => counter * 2, [counter]);`
    );

    expect(result).toEqual(`const doubledCounter = computed(() => counter * 2);`);
  });

});