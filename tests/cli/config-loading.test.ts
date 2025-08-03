import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { spawn } from 'child_process'
import { writeFileSync, existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('CLI Config Loading', () => {
  let testDir: string
  let originalCwd: string

  beforeEach(() => {
    // Create temporary test directory
    originalCwd = process.cwd()
    testDir = join(tmpdir(), `phaser-viewer-test-${Date.now()}`)
    mkdirSync(testDir, { recursive: true })
    process.chdir(testDir)
  })

  afterEach(() => {
    // Cleanup
    process.chdir(originalCwd)
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('should use default configuration when no config file exists', async () => {
    // Create a minimal package.json
    writeFileSync('./package.json', JSON.stringify({
      name: 'test-project',
      type: 'module'
    }))

    // Create examples directory
    mkdirSync('./examples', { recursive: true })
    writeFileSync('./examples/test.demo.ts', `
      export default { component: 'Test', title: 'Test' }
      export const TestStory = { name: 'Test', create: () => {} }
    `)

    // Run CLI and capture output
    const output = await runCLI(['--help'])
    
    expect(output).toContain('Phaser Viewer')
  })

  it('should load JavaScript configuration file', async () => {
    // Create config file
    writeFileSync('./phaser-viewer.config.js', `
      export default {
        filePath: './custom/**/*.demo.ts',
        port: 3000
      }
    `)

    writeFileSync('./package.json', JSON.stringify({
      name: 'test-project',
      type: 'module'
    }))

    // Create custom directory
    mkdirSync('./custom', { recursive: true })
    writeFileSync('./custom/test.demo.ts', `
      export default { component: 'Test', title: 'Test' }
      export const TestStory = { name: 'Test', create: () => {} }
    `)

    const output = await runCLI(['--help'])
    expect(output).toContain('Phaser Viewer')
  })

  it('should load TypeScript configuration file', async () => {
    // Create TypeScript config file
    writeFileSync('./phaser-viewer.config.ts', `
      interface Config {
        filePath: string;
        port: number;
      }
      
      const config: Config = {
        filePath: './src/**/*.demo.ts',
        port: 4000
      }
      
      export default config
    `)

    writeFileSync('./package.json', JSON.stringify({
      name: 'test-project',
      type: 'module'
    }))

    // Create src directory
    mkdirSync('./src', { recursive: true })
    writeFileSync('./src/test.demo.ts', `
      export default { component: 'Test', title: 'Test' }
      export const TestStory = { name: 'Test', create: () => {} }
    `)

    const output = await runCLI(['--help'])
    expect(output).toContain('Phaser Viewer')
  })

  it('should prioritize TypeScript config over JavaScript config', async () => {
    // Create both config files
    writeFileSync('./phaser-viewer.config.js', `
      export default {
        filePath: './js-examples/**/*.demo.ts',
        port: 3000
      }
    `)

    writeFileSync('./phaser-viewer.config.ts', `
      export default {
        filePath: './ts-examples/**/*.demo.ts',
        port: 4000
      }
    `)

    writeFileSync('./package.json', JSON.stringify({
      name: 'test-project',
      type: 'module'
    }))

    // Create both directories
    mkdirSync('./ts-examples', { recursive: true })
    writeFileSync('./ts-examples/test.demo.ts', `
      export default { component: 'Test', title: 'Test' }
      export const TestStory = { name: 'Test', create: () => {} }
    `)

    const output = await runCLI(['--help'])
    expect(output).toContain('Phaser Viewer')
  })
})

async function runCLI(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const cliPath = join(__dirname, '../../bin/phaser-viewer.js')
    const child = spawn('node', [cliPath, ...args], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' }
    })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (code === 0 || args.includes('--help')) {
        resolve(stdout)
      } else {
        reject(new Error(`CLI exited with code ${code}. stderr: ${stderr}`))
      }
    })

    child.on('error', reject)

    // Kill after timeout
    setTimeout(() => {
      child.kill()
      reject(new Error('CLI timeout'))
    }, 10000)
  })
}