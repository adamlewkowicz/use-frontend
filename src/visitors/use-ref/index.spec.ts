import { mountPluginTester } from '../../utils'
import { useRefPlugin } from '.'

describe('useRef Visitor', () => {

  const pluginTester = mountPluginTester(useRefPlugin);

  it('should change "useRef" function to "ref" ', () => {
    const result = pluginTester(
      `const input = useRef('');`
    );

    expect(result).toEqual(`const input = ref('');`);
  });

  it('should replace ".current" property to ".value"', () => {
    const result = pluginTester(
      `input.current = 'abc';`
    );

    expect(result).toEqual(`input.value = 'abc';`);
  });

});