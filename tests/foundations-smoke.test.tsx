import { render, screen } from '@testing-library/react-native';

import { Smoke } from '../src/design-system/foundations/FoundationsSmoke.stories';

describe('Foundations/Smoke', () => {
  it('renders the stable smoke heading', () => {
    render(<Smoke />);

    expect(screen.getByText('Foundations smoke story')).toBeVisible();
  });
});
