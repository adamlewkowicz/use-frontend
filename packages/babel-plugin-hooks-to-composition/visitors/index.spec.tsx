import { mountPluginTester } from '../utils';
import { hooksToCompositionPlugin } from '../index';

describe('useState', () => {
  
  const transform = mountPluginTester(hooksToCompositionPlugin);

  it('', () => {
    const result = transform(`
      const [counter, setCounter] = useState(0);
      setCounter(c => c + 1);
    `);

    expect(result).toEqual(`
      const counter = ref(0);

    `);
  });

});