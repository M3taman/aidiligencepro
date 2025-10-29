import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from '../DashboardPage';
import { AuthProvider } from '../../../context/AuthContext';

// Mock Firebase
vi.mock('../../../firebase', () => ({
  default: {}
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback({ uid: 'test-user', email: 'test@example.com' });
    return vi.fn(); // unsubscribe function
  }),
  signOut: vi.fn()
}));

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => vi.fn().mockResolvedValue({ data: {} }))
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard page', async () => {
    renderWithProviders(<DashboardPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });
  });

  it('handles report generation', async () => {
    renderWithProviders(<DashboardPage />);
    
    const companyInput = screen.getByPlaceholderText(/Enter company name/i) as HTMLInputElement;
    fireEvent.change(companyInput, { target: { value: 'Apple Inc.' } });
    
    expect(companyInput.value).toBe('Apple Inc.');
  });
});