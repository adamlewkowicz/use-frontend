import { transform } from '../../utils';

describe('useContext', () => {

  it('should replace "useContext" with "inject" method', () => {
    const result = transform(
      `const theme = useContext(ThemeContext);`
    );

    expect(result).toEqual(
      `const theme = inject(ThemeContext);`
    );
  });

});