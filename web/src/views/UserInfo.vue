<template>
	<div class="views-user-info">
		<h3>{{user.name}}</h3>
		<el-avatar :src="user.avatar"></el-avatar>
		<div>
			<span>注册时间: </span>
			<i-date :value="user.create_at"></i-date>
		</div>
		<div>
			<span>最近登录: </span>
			<i-date :value="user.login_at"></i-date>
		</div>
		<div>
			<span>返利: </span>
			{{user.rmb.toFixed(2)}}-{{user.rmbCost.toFixed(2)}}={{(user.rmb-user.rmbCost).toFixed(2)}}
		</div>
	</div>
</template>
<script>
export default {
	name: "UserInfo",
	props: {
		value: Number, // 用户ID
	},
	data() {
		return {
			user: {
				rmb: 0,
				rmbCost: 0,
			}
		}
	},
	computed: {

	},
	methods: {
		async query(id) {
			this.user = await this.$get('user/get', { id })
		}
	},
	mounted() {
		this.query(this.value)
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-user-info {
}
</style>
