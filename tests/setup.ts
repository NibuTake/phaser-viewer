import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Phaser globally for tests
global.Phaser = {
  Scene: vi.fn().mockImplementation(() => ({
    add: {
      existing: vi.fn()
    },
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn()
    }
  })),
  GameObjects: {
    Container: vi.fn(),
    Text: vi.fn(),
    Rectangle: vi.fn(),
    Image: vi.fn(),
    Sprite: vi.fn()
  },
  Game: vi.fn(),
  AUTO: 'AUTO'
} as unknown as typeof Phaser

// Mock window.iconUris
Object.defineProperty(window, 'iconUris', {
  value: {
    'icon-16': '/icons/icon-16.png',
    'icon-32': '/icons/icon-32.png',
    'icon-64': '/icons/icon-64.png',
    'icon-128': '/icons/icon-128.png'
  },
  writable: true
})

// Mock DOM APIs that might be used
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})