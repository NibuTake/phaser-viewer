import { describe, it, expect, vi } from 'vitest'
import { loadStoryGroupsFromModules } from '@/utils/storyLoader'

describe('storyLoader', () => {
  describe('loadStoryGroupsFromModules', () => {
    it('should process valid story modules correctly', async () => {
      const mockStoryModules = {
        '/src/Button.demo.ts': {
          default: {
            component: 'MockButton',
            title: 'UI/Button',
            description: 'A button component'
          },
          BasicButton: {
            name: 'Basic Button',
            args: { text: 'Click me' },
            create: vi.fn(),
            play: vi.fn()
          },
          PrimaryButton: {
            name: 'Primary Button',
            args: { text: 'Primary', variant: 'primary' },
            create: vi.fn(),
            play: vi.fn()
          }
        },
        '/src/Card.demo.ts': {
          default: {
            component: 'MockCard',
            title: 'UI/Card',
            description: 'A card component'
          },
          SimpleCard: {
            name: 'Simple Card',
            args: { title: 'Card Title' },
            create: vi.fn()
          }
        }
      }

      const storyGroups = await loadStoryGroupsFromModules(mockStoryModules)

      expect(storyGroups).toHaveLength(2)
      
      // Check first story group (Button)
      const buttonGroup = storyGroups.find(group => group.title === 'UI/Button')
      expect(buttonGroup).toBeDefined()
      expect(buttonGroup?.stories).toHaveLength(2)
      expect(buttonGroup?.stories[0].name).toBe('Basic Button')
      expect(buttonGroup?.stories[1].name).toBe('Primary Button')

      // Check second story group (Card)
      const cardGroup = storyGroups.find(group => group.title === 'UI/Card')
      expect(cardGroup).toBeDefined()
      expect(cardGroup?.stories).toHaveLength(1)
      expect(cardGroup?.stories[0].name).toBe('Simple Card')
    })

    it('should handle empty modules object', async () => {
      const storyGroups = await loadStoryGroupsFromModules({})
      
      expect(storyGroups).toHaveLength(0)
    })

    it('should skip modules without default export', async () => {
      const mockStoryModules = {
        '/src/Invalid.demo.ts': {
          SomeStory: {
            name: 'Some Story',
            create: vi.fn()
          }
        }
      }

      const storyGroups = await loadStoryGroupsFromModules(mockStoryModules)
      
      expect(storyGroups).toHaveLength(0)
    })

    it('should skip modules with invalid default export', async () => {
      const mockStoryModules = {
        '/src/Invalid.demo.ts': {
          default: null,
          SomeStory: {
            name: 'Some Story',
            create: vi.fn()
          }
        }
      }

      const storyGroups = await loadStoryGroupsFromModules(mockStoryModules)
      
      expect(storyGroups).toHaveLength(0)
    })

    it('should handle modules with no story exports', async () => {
      const mockStoryModules = {
        '/src/Empty.demo.ts': {
          default: {
            component: 'MockComponent',
            title: 'Test/Empty',
            description: 'Empty component'
          }
        }
      }

      const storyGroups = await loadStoryGroupsFromModules(mockStoryModules)
      
      // Based on the actual implementation, it seems empty modules are filtered out
      expect(storyGroups).toHaveLength(0)
    })

    it('should organize stories by category hierarchy', async () => {
      const mockStoryModules = {
        '/src/Button.demo.ts': {
          default: {
            component: 'MockButton',
            title: 'Components/Forms/Button',
            description: 'Button component'
          },
          BasicButton: {
            name: 'Basic Button',
            create: vi.fn()
          }
        },
        '/src/Input.demo.ts': {
          default: {
            component: 'MockInput',
            title: 'Components/Forms/Input',
            description: 'Input component'
          },
          BasicInput: {
            name: 'Basic Input',
            create: vi.fn()
          }
        }
      }

      const storyGroups = await loadStoryGroupsFromModules(mockStoryModules)
      
      expect(storyGroups).toHaveLength(2)
      expect(storyGroups.every(group => group.title.startsWith('Components/Forms/'))).toBe(true)
    })

    it('should preserve story metadata and functions', async () => {
      const createFunction = vi.fn()
      const playFunction = vi.fn()

      const mockStoryModules = {
        '/src/Test.demo.ts': {
          default: {
            component: 'MockComponent',
            title: 'Test/Component',
            description: 'Test component',
            tags: ['test', 'mock']
          },
          TestStory: {
            name: 'Test Story',
            args: { prop1: 'value1', prop2: 42 },
            create: createFunction,
            play: playFunction
          }
        }
      }

      const storyGroups = await loadStoryGroupsFromModules(mockStoryModules)
      
      expect(storyGroups).toHaveLength(1)
      
      const story = storyGroups[0].stories[0]
      expect(story.name).toBe('Test Story')
      expect(story.args).toEqual({ prop1: 'value1', prop2: 42 })
      // Functions are wrapped, so just check they exist and are callable
      expect(typeof story.create).toBe('function')
      expect(typeof story.play).toBe('function')

      const meta = storyGroups[0]
      expect(meta.description).toBe('Test component')
      expect(meta.tags).toEqual(['test', 'mock'])
    })
  })
})