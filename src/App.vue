<script setup lang="ts">
import type { AccentName, FlavorName } from '@catppuccin/palette';

import { get, set } from '@vueuse/core';
import { flavorEntries, flavors } from '@catppuccin/palette';

const accentEntries = flavors.latte.colorEntries.filter(
	([_, { accent }]) => accent,
);

const isDark = usePreferredDark();
const isMediumScreen = useMediaQuery('(min-width: 1024px)');

const mode = useColorMode<FlavorName>({
	attribute: 'theme',
	modes: Object.fromEntries(
		Object.keys(flavors).map((flavor) => [flavor, flavor]),
	),
	initialValue: isDark ? 'mocha' : 'latte',
});
const { state, next } = useCycleList<FlavorName>(
	Object.keys(flavors) as FlavorName[],
	{
		initialValue: mode as Ref<FlavorName>,
	},
);
watchEffect(() => set(mode, get(state)));

const darkFlavor = useStorage<FlavorName>('darkFlavor', 'mocha');
const lightFlavor = useStorage<FlavorName>('lightFlavor', 'latte');
const accentColor = useStorage<AccentName>('accentColor', 'mauve');

let original: null | UserstylesExport = null;
const output = ref();

const downloaded = ref(false);

function generateImportFile() {
	if (!original) return;
	set(
		output,
		JSON.stringify(
			original.map((userstyle, i) => {
				if (i === 0) return userstyle;
				if (userstyle.usercssData.vars.accentColor)
					userstyle.usercssData.vars.accentColor.value =
						get(accentColor);

				if (userstyle.usercssData.vars.darkFlavor)
					userstyle.usercssData.vars.darkFlavor.value =
						get(darkFlavor);

				if (userstyle.usercssData.vars.lightFlavor)
					userstyle.usercssData.vars.lightFlavor.value =
						get(lightFlavor);

				return userstyle;
			}),
		),
	);
}

function download() {
	const blob = new Blob([get(output)], {
		type: 'application/json',
	});
	const href = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = href;
	link.download = 'import.json';
	link.click();
	URL.revokeObjectURL(href);
	set(downloaded, true);
	setTimeout(() => {
		set(downloaded, false);
	}, 1000);
}

onMounted(async () => {
	original = (await import('../import.json').then(
		(m) => m.default,
	)) as UserstylesExport;
	generateImportFile();
});

watch(
	[lightFlavor, darkFlavor, accentColor],
	(n, o) => {
		const changed = o !== n;
		if (changed) generateImportFile();
	},
	{ immediate: true },
);

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		generateImportFile();
	});
}
</script>

<template>
	<div class="h-100vh w-full flex flex-col px4 pt4 text-lg">
		<header class="flex justify-between">
			<h1
				class="text-3xl"
				v-text="
					isMediumScreen
						? 'Catppuccin All Userstyles Import Generator'
						: 'CTP.AUI Generator'
				"
			/>
			<div class="flex flex-row gap-2 h-[min-content]">
				<a
					class="border border-surface0 border-rounded flex h-auto p2 hover:bg-mantle"
					aria-label="GitHub repository"
					href="https://github.com/uncenter/catppuccin-all-userstyles-import"
					target="_blank"
				>
					<div class="self-center i-carbon-logo-github" />
				</a>
				<button
					class="border border-surface0 border-rounded flex p2 hover:bg-mantle"
					:aria-label="`Toggle theme to ${flavors[state].name}`"
					@click="next()"
				>
					<span class="capitalize">{{ flavors[state].name }}</span>
				</button>
			</div>
		</header>
		<div
			class="flex flex-col md:flex-row gap-6 justify-center items-center p8"
		>
			<div class="flex flex-col md:flex-row gap-2">
				<div class="flex flex-col gap-2">
					<label for="lightFlavor">Light Flavor</label>
					<select
						id="lightFlavor"
						v-model="lightFlavor"
						class="border border-surface0 border-rounded bg-base p2"
						name="lightFlavor"
					>
						<option
							v-for="[flavor, { name }] in flavorEntries"
							:value="flavor"
						>
							{{ name }}
						</option>
					</select>
				</div>
				<div class="flex flex-col gap-2">
					<label for="darkFlavor">Dark Flavor</label>
					<select
						id="darkFlavor"
						v-model="darkFlavor"
						class="border border-surface0 border-rounded bg-base p2"
						name="darkFlavor"
					>
						<option
							v-for="[flavor, { name }] in flavorEntries"
							:value="flavor"
						>
							{{ name }}
						</option>
					</select>
				</div>
				<div class="flex flex-col gap-2">
					<label for="accentColor">Accent Color</label>
					<select
						id="accentColor"
						v-model="accentColor"
						class="border border-surface0 border-rounded bg-base p2"
						name="accentColor"
					>
						<option
							v-for="[color, { name }] in accentEntries"
							:value="color"
						>
							{{ name }}
						</option>
					</select>
				</div>
			</div>
			<button
				class="border-rounded flex flex-row gap-2 self-center md:self-end bg-green text-base p2 justify-center items-center"
				title="Download"
				@click="download()"
			>
				<span v-text="downloaded ? 'Downloaded!' : 'Download'" />
				<div
					:class="
						downloaded ? 'i-carbon-checkmark' : 'i-carbon-download'
					"
				/>
			</button>
		</div>
	</div>
</template>

<style></style>
