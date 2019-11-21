<template>
	<div>
		<v-app-bar app fixed color="#fafafa" elevate-on-scroll scroll-target="#parallax">
			<v-toolbar-title>盆儿支付</v-toolbar-title>
			<v-spacer></v-spacer>
			<template v-if="$user.online">
				<v-avatar size="36">
					<img :src="$user.info.avatar"></img>
				</v-avatar>
				<v-toolbar-items>
					<v-btn text to="/setting">{{$user.info.name}}</v-btn>
					<v-btn text to="/orders">控制台</v-btn>
					<v-btn text to="/login">注销</v-btn>
				</v-toolbar-items>
			</template>
			<v-toolbar-items v-else="$user.online">
				<v-btn text to="/login">登录</v-btn>
			</v-toolbar-items>
		</v-app-bar>
		<v-parallax id="parallax" src="https://bufpay.com/htdocs/img/header.jpg">
			<h1 class="tac mt-12">个人收款平台</h1>
			<h2 class="tac mt-12">无需公司资质，无需签约，直接到账，无手续费，支持微信支持宝</h2>
			<div class="tac mt-12">
				<v-btn color="primary" rounded to="/qrcode">立即开户</v-btn>
				<v-btn color="success" rounded to="/donate/1" class="ml-12">支付体验</v-btn>
			</div>
		</v-parallax>
		<v-sheet color="blue" dark></v-sheet>
		<v-footer app>
			<span class="grey--text">&copy; 2019</span>
		</v-footer>
	</div>
</template>
<script>
export default {
	name: "Home",
	data() {
		return {
			show: false,
		}
	},
	computed: {
	},
	methods: {
	},
	mounted() {
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-home {
	max-width: 50rem;
	margin: 0 auto;
	.flex-center {
		> .card {
			flex: 1;
			text-align: center;
		}
	}
}
</style>
