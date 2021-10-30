import { defineConfig } from 'umi';

export default defineConfig({
    nodeModulesTransform: {
        type: 'none',
    },
    routes: [
        { path: '/', component: '@/pages/Index' },
    ],
    fastRefresh: {},
    history: {
        type: "hash"
    },
    copy: ["utools/logo.png", "utools/plugin.json", "utools/preload.js"],
    outputPath: "uTools_pak"
});
