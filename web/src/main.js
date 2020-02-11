import Vue from 'vue';
import * as utils from './common/utils';
import * as ivue from './ivue';
import App from './App.vue';
import router from './router';
import { store } from './common/store';
import vuetify from './vuetify';
import './styles/index.less';
import IView from './components';
Vue.use(IView);
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);
const i18n = new VueI18n({
	locale: 'zh', // 语言标识 
	messages: {
		'zh': require('./assets/lang/zh'),
		'en': require('./assets/lang/en')
	}
});

window.utils = utils;
window.ivue = ivue;

if (utils.ua.wx)
	utils.loadjs('http://res.wx.qq.com/open/js/jweixin-1.4.0.js').then(x => utils.http.get('wechat/get_config', null, { ignore: true })).then(x => {
		x.debug = utils.ua.dev;
		utils.ua.appid = x.appid;
		x.jsApiList = ['previewImage'];
		wx.config(x);
	});
Vue.use(Vuetify);
Vue.config.productionTip = false;
window.vue = new Vue({
	i18n,
	router,
	vuetify,
	data: store,
	render: h => h(App)
}).$mount('#app');