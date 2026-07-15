import '@testing-library/react';

import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
