import {
	defineConfig,
	presetAttributify,
	presetIcons,
	presetUno,
	presetWebFonts,
	transformerDirectives,
} from 'unocss';

import { flavors, flavorEntries } from '@catppuccin/palette';

const CTP_PREFIX = false;
const CTP_SELECTOR = (flavor: string) => `[theme="${flavor}"]`;

export default defineConfig({
	theme: {
		colors: {
			...Object.fromEntries(
				flavors.latte.colorEntries.map(([name]) => [
					`${CTP_PREFIX ? CTP_PREFIX + '-' : ''}${name}`,
					`var(--ctp-${name})`,
				]),
			),
		},
	},
	preflights: [
		{
			getCSS: ({ theme }) => {
				return flavorEntries
					.map(
						([flavor, { colors, dark }]) => `
:root${CTP_SELECTOR(flavor)} {
    ${dark ? 'color-scheme: dark;' : 'color-scheme: light;'}
    ${Object.entries(colors)
			.map(([name, { hex }]) => `--ctp-${name}: ${hex};`)
			.join('\n')};
}`,
					)
					.join('\n');
			},
		},
	],
	presets: [
		presetUno(),
		presetAttributify(),
		presetIcons({
			scale: 1.2,
			warn: true,
		}),
		presetWebFonts({
			fonts: {
				sans: 'DM Sans',
				serif: 'DM Serif Display',
				mono: 'DM Mono',
			},
		}),
	],
	transformers: [transformerDirectives()],
});
