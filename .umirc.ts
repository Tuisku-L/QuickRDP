import { defineConfig } from 'umi';

export default defineConfig({
    nodeModulesTransform: {
        type: 'none',
    },
    routes: [
        {
            path: '/',
            exact: true,
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
        {
            path:"/remote",
            component: "@/pages/Remote",
            exact: true
        }
    ],
    fastRefresh: {},
    history: {
        type: "hash"
    },
    copy: ["utools/logo.png", "utools/plugin.json", "utools/preload.js"],
    outputPath: "uTools_pak"
});
