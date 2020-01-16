import { testVisitors } from '../../utils';
import { useMemoVisitors } from './index';

describe('useMemo visitors', () => {

  const pluginTester = testVisitors(...useMemoVisitors);

  it('should transform useMemo to computed', () => {
    const result = pluginTester(
      `const doubledCounter = useMemo(() => counter * 2, [counter]);`
    );

    expect(result).toEqual(`const doubledCounter = computed(() => counter * 2);`);
  });

});