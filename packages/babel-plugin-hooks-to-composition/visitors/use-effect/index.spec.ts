import { testVisitors } from '../../utils';
import { useEffectVisitors } from './index';

describe('useEffect visitors', () => {

  const transform = testVisitors(...useEffectVisitors);

  describe('when "useEffect" has no dependencies', () => {

    it('should replace "useEffect" with "onMounted"', () => {
      const result = transform(`useEffect(() => {}, []);`);

      expect(result).toEqual(`onMounted(() => {});`);
    });

  });

  it.todo('should transform "useEffect" to "watch"');

});