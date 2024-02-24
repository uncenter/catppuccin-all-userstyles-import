<script setup lang="ts">
const FLAVORS = ['Latte', 'Frappe', 'Macchiato', 'Mocha']
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
]

const isDark = usePreferredDark()
const isMediumScreen = useMediaQuery('(min-width: 1024px)')

const mode = useColorMode({
  attribute: 'theme',
  modes: Object.fromEntries(
    FLAVORS.map(flavor => [flavor.toLowerCase(), flavor.toLowerCase()]),
  ),
  initialValue: isDark ? 'mocha' : 'latte',
})
const { state, next } = useCycleList(
  FLAVORS.map(flavor => flavor.toLowerCase()),
  { initialValue: mode },
)
watchEffect(() => (mode.value = state.value as any))

const darkFlavor = useStorage('darkFlavor', 'Mocha')
const lightFlavor = useStorage('lightFlavor', 'Latte')
const accentColor = useStorage('accentColor', 'Sapphire')

type UserstylesExport = Userstyle[]

interface Userstyle {
  enabled: boolean
  name?: string
  description?: string
  author?: string
  updateUrl?: string
  usercssData: UsercssData
  sourceCode: string
  settings?: Settings
}

interface UsercssData {
  name: string
  namespace: string
  homepageURL: string
  version: string
  updateURL: string
  supportURL: string
  description: string
  author: string
  license: string
  preprocessor: string
  vars: Vars
}

interface Vars {
  flavor?: Variable
  accentColor?: Variable
  lightFlavor?: Variable
  darkFlavor?: Variable
}

interface Variable {
  type: string
  label: string
  name: string
  value: any
  default: string
  options: Option[]
}

interface Option {
  name: string
  label: string
  value: string
}

interface Settings {
  updateInterval: number
  updateOnlyEnabled: boolean
  patchCsp: boolean
}

let original: null | UserstylesExport = null
const output = ref()

const downloaded = ref(false)

function generateImportFile() {
  if (!original)
    return
  output.value = JSON.stringify(
    original.map((userstyle, i) => {
      if (i === 0)
        return userstyle
      if (userstyle.usercssData.vars.accentColor)
        userstyle.usercssData.vars.accentColor.value = accentColor.value.toLowerCase()

      if (userstyle.usercssData.vars.darkFlavor)
        userstyle.usercssData.vars.darkFlavor.value = darkFlavor.value.toLowerCase()

      if (userstyle.usercssData.vars.lightFlavor)
        userstyle.usercssData.vars.lightFlavor.value = lightFlavor.value.toLowerCase()

      return userstyle
    }),
  )
}

function download() {
  const blob = new Blob([output.value], {
    type: 'application/json',
  })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = 'import.json'
  link.click()
  URL.revokeObjectURL(href)
  downloaded.value = true
  setTimeout(() => {
    downloaded.value = false
  }, 1000)
}

onMounted(async () => {
  original = (await import('../import.json').then(
    m => m.default,
  )) as UserstylesExport
  generateImportFile()
})

watch(
  [lightFlavor, darkFlavor, accentColor],
  (n, o) => {
    const changed = o !== n
    if (changed)
      generateImportFile()
  },
  { immediate: true },
)

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    generateImportFile()
  })
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
          :aria-label="`Toggle theme to ${state}`"
          @click="next()"
        >
          <span class="capitalize">{{ state }}</span>
        </button>
      </div>
    </header>
    <div class="flex flex-col md:flex-row gap-6 justify-center items-center p8">
      <div class="flex flex-col md:flex-row gap-2">
        <div class="flex flex-col gap-2">
          <label for="lightFlavor">Light Flavor</label>
          <select
            id="lightFlavor"
            v-model="lightFlavor"
            class="border border-surface0 border-rounded bg-base p2"
            name="lightFlavor"
          >
            <option v-for="flavor in FLAVORS">
              {{ flavor }}
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
            <option v-for="flavor in FLAVORS">
              {{ flavor }}
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
            <option v-for="accent in ACCENTS">
              {{ accent }}
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
        <div :class="downloaded ? 'i-carbon-checkmark' : 'i-carbon-download'" />
      </button>
    </div>
  </div>
</template>

<style></style>
