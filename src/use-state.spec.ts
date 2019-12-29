import { useStatePlugin } from './use-state';
import { mountPluginTester } from './utils';

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