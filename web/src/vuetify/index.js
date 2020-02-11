import Vue from 'vue';
import zhHans from 'vuetify/es5/locale/zh-Hans';
import Vuetify from 'vuetify';

import IvForm from './IvForm';
Vue.component('IvForm', IvForm);

export default new Vuetify({
	icons: {
		iconfont: 'mdi', // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
	},
	lang: {
		locales: { zhHans },
		current: 'zhHans',
	},
});