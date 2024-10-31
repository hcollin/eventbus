/// <reference types="vitest" />
import {defineConfig} from 'vite';


export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: 'eventbus',
            fileName: (format) => `eventbus.${format}.js`
        },
        rollupOptions: {
            external: ['eventbus'],
            output: {
                globals: {
                    eventbus: 'eventbus'
                }
            }
        }
    },
    test: {
        environment: 'happy-dom'
    }
    
});