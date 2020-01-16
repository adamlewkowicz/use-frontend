import { useStateVisitors } from '.';
import { testVisitors } from '../../utils';

describe('useState Plugin', () => {

  const transform = testVisitors(...useStateVisitors);

  describe('state declaration', () => {

    it('should transform destructuring to single variable and change function name', () => {
      const result = transform(
        `const [counter, setCounter] = useState(0);`
      );
  
      expect(result).toEqual(`const counter = reactive(0);`);
    });

  });


  describe('state update', () => {

    it('should remove "setState" function call', () => {
      const result = transform(
        `setCounter(counter + 1);`
      );

      expect(result).toEqual(`counter + 1;`);
    });

    it(
      'should handle "setState" calls with arrow function as an argument, ' + 
      'eg. "setCounter(counter => counter + 1)"'
    , () => {
      const result = transform(`
        const [counter, setCounter] = useState(0);
        setCounter(c => c * 2);
      `);

      expect(result).toEqual(`
        const counter = reactive(0);
        counter * 2;
      `);
    });

  });

  it.todo('should convert primitive values eg. "useState(0)" to reactive object');

  describe('"setState" calls', () => {

    it('should replace "setState(variable)" calls with "state = variable" assignments', () => {
      // state declaration only for plugin tracker purpose
      const result = transform(`
        const nextCounter = 1;
        const [counter, setCounter] = useState(0); 
        setCounter(nextCounter);
      `);

      expect(result).toEqual(`
        const nextCounter = 1;
        const counter = ref(0); 
        counter.value = nextCounter;
      `);
    });

  });

});