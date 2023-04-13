// Файл для поключения вебпака, пока нужен для тестирования
import Vue from 'vue/dist/vue.js';
import WebpackEntry from './webpack-entry.vue';

import VueI18n from 'vue-i18n';

Vue.use( VueI18n );

const i18n = new VueI18n( {
    locale : 'ru',
} );

window.app = new Vue( {
    i18n,
    el     : '#app',
    render : h => h( WebpackEntry ),
} );
