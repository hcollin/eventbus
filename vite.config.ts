/// <reference types="vitest" />
import {defineConfig} from 'vite';
import dts from "vite-plugin-dts";

const packageName = 'hceventbus';

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: 'src/main.ts',
            name: packageName,
            fileName: "index",
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