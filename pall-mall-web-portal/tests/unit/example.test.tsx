import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { store } from '@app/store';
import { lightTheme } from '@theme';

/**
 * Test utilities
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={lightTheme}>
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: AllTheProviders });
};

/**
 * Example test suite
 */
describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should render text', () => {
    const TestComponent = () => <div>Hello Test</div>;
    renderWithProviders(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});
