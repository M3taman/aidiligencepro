import { renderHook } from '@testing-library/react';
import { useMCP } from '../../../hooks/useMCP';

describe('useMCP', () => {
  it('should return an MCP client', () => {
    const { result } = renderHook(() => useMCP());
    expect(result.current.client).toBeDefined();
  });
});