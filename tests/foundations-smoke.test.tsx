import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { Smoke } from '../src/design-system/foundations/FoundationsSmoke.stories';

describe('Foundations/Smoke', () => {
  it('renders the stable smoke heading', async () => {
    const { getByText } = await render(<Smoke />);

    expect(getByText('Foundations smoke story')).toBeVisible();
  });
});
