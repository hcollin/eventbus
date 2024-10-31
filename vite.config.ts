/// <reference types="vitest" />
import {defineConfig} from 'vite';


const packageName = 'hceventbus';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts',
            name: packageName,
            fileName: (format) => `hceventbus.${format}.js`,
            formats: ['es', 'cjs']
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