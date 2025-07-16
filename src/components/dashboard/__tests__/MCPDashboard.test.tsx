
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MCPDashboard from '../MCPDashboard';

describe('MCPDashboard', () => {
  it('renders the dashboard title', () => {
    render(<MCPDashboard />);
    expect(screen.getByText('MCP Dashboard')).toBeInTheDocument();
  });
});
