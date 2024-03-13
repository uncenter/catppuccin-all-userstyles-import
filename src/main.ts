import { createApp } from 'vue';
import App from './App.vue';

import '@unocss/reset/tailwind.css';
import 'uno.css';

import { useStorageVersioning } from './utils';

useStorageVersioning('3/12/24');

createApp(App).mount('#app');
