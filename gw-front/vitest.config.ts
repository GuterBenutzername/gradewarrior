import {defineConfig} from 'vitest/config'
import preact from '@preact/preset-vite'


export default defineConfig({
  plugins: [preact()],
  test: {
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp,direnv}/**', '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'],
    environment: 'jsdom',
  },
})