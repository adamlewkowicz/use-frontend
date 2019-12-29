import * as babel from '@babel/core';
import { useStatePlugin } from './use-state';

const mountPluginTester = (
  ...plugins: babel.PluginItem[]
) => (code: string): string => {
  const result = babel.transform(code, { plugins });

  if (result?.code == null) {
    throw new Error(
      `Could not transform code properly: "${result?.code}"`
    );
  }

  return result.code;
}

describe('useState Plugin', () => {

  let pluginTester = mountPluginTester(useStatePlugin);

  describe('state declaration', () => {

    it('should transform destructuring to single variable and change function name', () => {
      const result = pluginTester(
        `const [counter, setCounter] = useState(0);`
      );
  
      expect(result).toEqual(`const counter = reactive(0);`);
    });

  });


  describe('state update', () => {

    it('should remove "setState" function call', () => {
      const result = pluginTester(
        `setCounter(counter + 1);`
      );

      expect(result).toEqual(`counter + 1;`);
    });

  });

});