import { transform } from '../../utils';

describe('useMemo', () => {

  it('should transform "useMemo" to "computed"', () => {
    const result = transform(
      `const doubledCounter = useMemo(() => counter * 2, [counter]);`
    );

    expect(result).toEqual(`const doubledCounter = computed(() => counter * 2);`);
  });

});