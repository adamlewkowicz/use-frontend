import { transform } from '../../utils';

describe('useRef Visitor', () => {

  it('should replace "useRef" with "ref" ', () => {
    const result = transform(
      `const input = useRef('');`
    );

    expect(result).toEqual(`const input = ref('');`);
  });

  it('should replace ".current" to ".value" property', () => {
    const result = transform(
      `input.current = 'abc';`
    );

    expect(result).toEqual(`input.value = 'abc';`);
  });

});