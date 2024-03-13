import { defineConfig } from 'vite';

import Vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import UnoCSS from 'unocss/vite';

export default defineConfig({
	plugins: [
		// https://github.com/vitejs/vite-plugin-vue
		Vue(),

		// https://github.com/unplugin/unplugin-auto-import
		AutoImport({
			imports: ['vue', '@vueuse/core'],
			dts: true,
			vueTemplate: true,
		}),

		// https://github.com/unocss/unocss
		UnoCSS(),
	],
});
