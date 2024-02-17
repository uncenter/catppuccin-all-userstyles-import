<script setup lang="ts">
import { useColorMode, useCycleList } from '@vueuse/core';

let mode = useColorMode({
	attribute: 'theme',
	modes: {
		latte: 'latte',
		frappe: 'frappe',
		macchiato: 'macchiato',
		mocha: 'mocha',
	},
});

const { state, next } = useCycleList(
	['latte', 'frappe', 'macchiato', 'mocha'],
	{ initialValue: mode },
);
watchEffect(() => (mode.value = state.value as any));

const FLAVORS = ['Latte', 'Frappe', 'Macchiato', 'Mocha'];
const ACCENTS = [
	'Rosewater',
	'Flamingo',
	'Pink',
	'Mauve',
	'Red',
	'Maroon',
	'Peach',
	'Yellow',
	'Green',
	'Teal',
	'Blue',
	'Sapphire',
	'Sky',
	'Lavender',
	'Gray',
];
const darkFlavor = useStorage('darkFlavor', 'Mocha');
const lightFlavor = useStorage('lightFlavor', 'Latte');
const accentColor = useStorage('accentColor', 'Sapphire');

type UserstylesExport = Userstyle[];

type Userstyle = {
	enabled: boolean;
	name?: string;
	description?: string;
	author?: string;
	updateUrl?: string;
	usercssData: UsercssData;
	sourceCode: string;
	settings?: Settings;
};

type UsercssData = {
	name: string;
	namespace: string;
	homepageURL: string;
	version: string;
	updateURL: string;
	supportURL: string;
	description: string;
	author: string;
	license: string;
	preprocessor: string;
	vars: Vars;
};

type Vars = {
	flavor?: Flavor;
	accentColor?: AccentColor;
	lightFlavour?: Flavor;
	darkFlavour?: Flavor;
	lightFlavor?: Flavor;
	darkFlavor?: Flavor;
};

type Flavor = {
	type: string;
	label: string;
	name: string;
	value: any;
	default: string;
	options: Option[];
};

type Option = {
	name: string;
	label: string;
	value: string;
};

type AccentColor = {
	type: string;
	label: string;
	name: string;
	value: any;
	default: string;
	options: Option[];
};

type Settings = {
	updateInterval: number;
	updateOnlyEnabled: boolean;
	patchCsp: boolean;
};

let original = null as null | UserstylesExport;
const output = ref();

const downloaded = ref(false);

function generateImportFile() {
	if (!original) return;
	output.value = JSON.stringify(
		original.map((userstyle, i) => {
			if (i === 0) return userstyle;
			if (userstyle.usercssData.vars.accentColor)
				userstyle.usercssData.vars.accentColor.value =
					accentColor.value.toLowerCase();
			if (
				userstyle.usercssData.vars.darkFlavor &&
				userstyle.usercssData.vars.lightFlavor
			) {
				userstyle.usercssData.vars.darkFlavor.value =
					darkFlavor.value.toLowerCase();
				userstyle.usercssData.vars.lightFlavor.value =
					lightFlavor.value.toLowerCase();
			}
			return userstyle;
		}),
	);
}

function download() {
	const blob = new Blob([output.value], {
		type: 'application/json',
	});
	const href = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = href;
	link.download = 'import.json';
	link.click();
	URL.revokeObjectURL(href);
	downloaded.value = true;
	setTimeout(() => {
		downloaded.value = false;
	}, 1000);
}

onMounted(async () => {
	original = (await import('../import.json').then(
		(m) => m.default,
	)) as UserstylesExport;
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
	<div h-100vh w-full px4 pt-4>
		<header flex="~ justify-between">
			<h1 text-2xl>All Userstyles Import Generator</h1>
			<div flex="~ row gap-2">
				<a
					border="~ surface0 rounded"
					p2
					hover="bg-active"
					href="https://github.com/uncenter/ctp-userstyles-all-userstyles-import"
					target="_blank"
				>
					<div i-carbon-logo-github />
				</a>
				<button @click="next()">
					<span class="ml-2 capitalize">{{ state }}</span>
				</button>
			</div>
		</header>
		<div flex="~ col md:row gap-6" justify-center items-center p4>
			<div flex="~ col md:row gap-2">
				<div flex="~ col gap-2">
					<label for="lightFlavor">Light Flavor</label>
					<select
						border="~ surface0 rounded"
						bg-base
						p2
						v-model="lightFlavor"
						name="lightFlavor"
						id="lightFlavor"
					>
						<option v-for="flavor in FLAVORS">
							{{ flavor }}
						</option>
					</select>
				</div>
				<div flex="~ col gap-2">
					<label for="darkFlavor">Dark Flavor</label>
					<select
						border="~ surface0 rounded"
						bg-base
						p2
						v-model="darkFlavor"
						name="darkFlavor"
						id="darkFlavor"
					>
						<option v-for="flavor in FLAVORS">
							{{ flavor }}
						</option>
					</select>
				</div>
				<div flex="~ col gap-2">
					<label for="accent">Accent Color</label>
					<select
						border="~ surface0 rounded"
						bg-base
						p2
						v-model="accentColor"
						name="accentColor"
						id="accentColor"
					>
						<option v-for="accent in ACCENTS">
							{{ accent }}
						</option>
					</select>
				</div>
			</div>
			<button
				border-rounded
				flex="~ row gap-2 self-end"
				bg-green
				text-base
				p2
				justify-center
				items-center
				title="Download"
				@click="download()"
			>
				<span v-text="downloaded ? 'Downloaded!' : 'Download'"></span>
				<div v-if="downloaded" i-carbon-checkmark />
				<div v-else i-carbon-download />
			</button>
		</div>
	</div>
</template>

<style></style>
