import Vue from 'vue';

const rules = {
	email(need, lbl = "邮箱") {
		return [
			need ? (v => !!v || `${lbl}是必填项`) : true,
			v => !v || /.+@.+\..+/.test(v) || `${lbl}格式不正确`,
		];
	},
	passwd(need, lbl = "密码") {
		return [
			need ? (v => !!v || `${lbl}是必填项目`) : true,
			v => !v || v.length >= 6 || `${lbl}至少6位`,
		];
	},
	price(need, lbl = '') {
		return [
			need ? (v => !!v || `${lbl}是必填项`) : true,
			v => !v || v >= 0 || `${lbl}不能为负数`
		];
	},
};

Vue.prototype.$rules = rules;
export default rules;