<script setup lang="ts">
import type { AccentName, FlavorName } from '@catppuccin/palette';

import rawUserstylesImport from '../import.json' with { type: 'json' };

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

const userstylesImport = ref<UserstylesExport>(
	rawUserstylesImport as UserstylesExport,
);

const customUserstylesImport = computed(() => {
	return JSON.stringify(
		get(userstylesImport).map((userstyle, i) => {
			// First "userstyle" holds Stylus settings.
			if (i === 0) return userstyle;

			let vars = userstyle.usercssData.vars;

			vars.accentColor.value = get(accentColor);
			vars.darkFlavor.value = get(darkFlavor);
			vars.lightFlavor.value = get(lightFlavor);

			return {
				...userstyle,
				usercssData: {
					...userstyle.usercssData,
					vars,
				},
			};
		}),
	);
});

const downloaded = ref(false);

function download() {
	const blob = new Blob([get(customUserstylesImport)], {
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
</script>

<template>
	<div class="h-100vh w-full flex flex-col px4 pt4 text-lg">
		<header class="flex justify-between">
			<h1 class="text-3xl">Catppuccin Userstyles Customizer</h1>
			<div class="flex flex-row gap-2 h-[min-content]">
				<a
					class="border border-surface0 border-rounded flex h-auto p2 hover:bg-mantle"
					aria-label="GitHub repository"
					href="https://github.com/uncenter/catppuccin-userstyles-customizer"
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
				class="border-rounded flex flex-row gap-2 self-center md:self-end bg-green text-base p2 justify-center items-center group"
				title="Download"
				@click="download()"
			>
				<span v-text="downloaded ? 'Downloaded!' : 'Download'" />
				<i v-if="downloaded" class="i-carbon-checkmark" />
				<i v-else class="i-carbon-download group-hover:animate-tada" />
			</button>
		</div>
	</div>
</template>

<style></style>
