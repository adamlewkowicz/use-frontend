import * as babel from '@babel/core';
import { useStatePlugin } from './use-state';

const mountPluginTester = (...plugins: babel.PluginItem[]) => {
  return (code: string): string => {
    const result = babel.transform(code, { plugins });

    if (result === null || result.code == null) {
      throw Error;
    }

    return result.code;
  };
}

describe('useState Plugin', () => {

  let pluginTester = mountPluginTester(useStatePlugin);

  it('should transform useState correctly', () => {
    const result = pluginTester(
      `const [counter, setCounter] = useState(0);`
    );

    expect(result).toMatchSnapshot();
  });

});