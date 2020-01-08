import { testVisitors } from '../../utils';
import { useContextVisitors } from './';

describe('useContext', () => {

  const transform = testVisitors(...useContextVisitors);

  it('should replace "useContext" with "inject" method', () => {
    const result = transform(
      `const theme = useContext(ThemeContext);`
    );

    expect(result).toEqual(
      `const theme = inject(ThemeContext);`
    );
  });

});