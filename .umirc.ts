import { defineConfig } from 'umi';

export default defineConfig({
    nodeModulesTransform: {
        type: 'none',
    },
    routes: [
        {
            path:"/remote",
            component: "@/pages/Remote",
            exact: true
        },
        {
            path: '/',
            component: '@/layouts/_mainLayout',
            routes: [
                {
                    path: "/",
                    exact: true,
                    component: "@/pages/Index"
                },
                {
                    path: "/setting",
                    exact: true,
                    component: "@/pages/Setting"
                }
            ]
        }
    ],
    fastRefresh: {},
    history: {
        type: "hash"
    },
    copy: ["utools/logo.png", "utools/plugin.json", "utools/preload.js"],
    outputPath: "uTools_pak"
});
