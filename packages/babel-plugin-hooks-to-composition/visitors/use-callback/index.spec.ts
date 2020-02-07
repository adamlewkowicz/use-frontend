import { transform } from '../../utils';

describe('useCallback', () => {

  it('should transform "useCallback" to "computed" wrapped callback', () => {
    const result = transform(
      `const doubledCounterCb = useCallback(() => counter * 3, [counter]);`
    );

    expect(result).toEqual(`const doubledCounterCb = computed(() => () => counter * 3);`);
  });

  it.todo('should replace "useCallback" with raw callback');

});