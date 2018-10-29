<template>
	<div class="parts-user-login">
		<i-input v-model="body.title" title="账号"></i-input>
		<i-input v-model="body.password" title="密码" type="password"></i-input>
		<button class="primary" @click="login(body)">登录</button>
	</div>
</template>
<script>
import { mapState, mapActions } from "vuex";

export default {
	name: "UserLogin",
	data() {
		return {
			body: {
				title: '',
				password: '',
			}
		}
	},
	computed: {

	},
	methods: {
		...mapActions(['login']),
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/methods.less";
.parts-user-login {
  .i-input {
    margin-bottom: 1em;
  }
}
</style>
