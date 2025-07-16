
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '../DashboardPage';
import * as functions from 'firebase/functions';

// Mock Firebase functions
vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(),
}));

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="mock-chart" />,
}));

describe('DashboardPage Integration', () => {
  it('should fetch and display a report when a company name is submitted', async () => {
    const mockReport = {
      data: {
        reportSummary: 'Apple Inc. shows strong market performance.',
        sentiment: 0.85,
        prediction: 'Strong Buy',
        confidence: 0.92,
        keyMetrics: { 'P/E Ratio': 28.5, 'Market Cap': '$2.9T' },
        sentimentHistory: [0.6, 0.7, 0.8],
      },
    };

    // Setup the mock implementation for httpsCallable
    const getMCPDataMock = vi.fn().mockResolvedValue(mockReport);
    (functions.httpsCallable as vi.Mock).mockReturnValue(getMCPDataMock);

    render(<DashboardPage />);

    // 1. Find the input and button
    const input = screen.getByPlaceholderText('Enter Company Name (e.g., Apple, Tesla)');
    const generateButton = screen.getByRole('button', { name: /Generate Report/i });

    // 2. Simulate user input
    fireEvent.change(input, { target: { value: 'Apple' } });
    expect(input.value).toBe('Apple');

    // 3. Simulate button click
    fireEvent.click(generateButton);

    // 4. Verify loading state and function call
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(functions.httpsCallable).toHaveBeenCalledWith(undefined, 'getMCPData');
    expect(getMCPDataMock).toHaveBeenCalledWith({ company: 'Apple' });

    // 5. Wait for the report to be displayed
    await waitFor(() => {
      expect(screen.getByText('Apple Due Diligence Report')).toBeInTheDocument();
    });

    // 6. Verify the content of the report
    expect(screen.getByText('AI-Generated Summary')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc. shows strong market performance.')).toBeInTheDocument();
    expect(screen.getByText('P/E Ratio:')).toBeInTheDocument();
    expect(screen.getByText('28.5')).toBeInTheDocument();
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('should display an error message if the input is empty', async () => {
    render(<DashboardPage />);
    const generateButton = screen.getByRole('button', { name: /Generate Report/i });
    fireEvent.click(generateButton);
    expect(await screen.findByText('Please enter a company name.')).toBeInTheDocument();
  });
});
