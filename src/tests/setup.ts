import '@testing-library/jest-dom/vitest';

// Polyfill for ResizeObserver
const global = globalThis as typeof globalThis;
global.ResizeObserver = class ResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element, options?: ResizeObserverOptions): void {
    this.callback([{ contentRect: target.getBoundingClientRect() }] as ResizeObserverEntry[], this);
  }

  unobserve(target: Element): void {
    // Mock unobserve
  }

  disconnect(): void {
    // Mock disconnect
  }
};