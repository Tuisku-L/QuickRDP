import { defineConfig } from 'umi';

export default defineConfig({
    nodeModulesTransform: {
        type: 'none',
    },
    routes: [
        {
            path: '/',
            component: '@/layouts/_mainLayout',
            routes: [
                {
                    path: "/",
                    component: "@/pages/Index"
                },
                {
                    path: "/setting",
                    component: "@/pages/Setting"
                }
            ]
        },
    ],
    fastRefresh: {},
    history: {
        type: "hash"
    },
    copy: ["utools/logo.png", "utools/plugin.json", "utools/preload.js"],
    outputPath: "uTools_pak"
});
