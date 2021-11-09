import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/remote',
      component: '@/pages/Remote',
      exact: true,
    },
    {
      path: '/info',
      component: '@/pages/Info',
      exact: true,
    },
    {
      path: '/',
      component: '@/layouts/_mainLayout',
      routes: [
        {
          path: '/',
          exact: true,
          component: '@/pages/Index',
        },
        {
          path: '/setting',
          exact: true,
          component: '@/pages/Setting',
        },
      ],
    },
  ],
  fastRefresh: {},
  history: {
    type: 'hash',
  },
  copy: [
    'utools/qr_logo.png',
    'utools/plugin.json',
    'utools/remote.html',
    {
      from: 'utools/lib/preload.js',
      to: 'lib/preload.js',
    },
    {
      from: 'utools/lib/remote_preload.js',
      to: 'lib/remote_preload.js',
    },
    {
      from: 'utools/lib/eruda.js',
      to: 'lib/eruda.js',
    },
  ],
  outputPath: 'uTools_pak',
  publicPath: './',
  scripts: [
    {
      src: './lib/eruda.js',
    },
    'window.initDev = () => {eruda.init()}',
  ],
});
