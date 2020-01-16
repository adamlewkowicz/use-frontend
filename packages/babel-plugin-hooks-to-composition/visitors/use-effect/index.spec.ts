import { testVisitors } from '../../utils';
import { useEffectVisitors } from './index';

describe('useEffect visitors', () => {

  const transform = testVisitors(...useEffectVisitors);

  it.todo('', () => {
    const result = transform(
      ``
    );

    expect(result).toEqual(
      ``
    );
  });

});