import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Pocket Notes heading', () => {
  render(<App />);
  expect(screen.getAllByText(/pocket notes/i)[0]).toBeInTheDocument();
});
