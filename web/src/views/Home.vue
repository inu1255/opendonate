<template>
	<div>
		<v-app-bar app fixed color="#fafafa" elevate-on-scroll scroll-target="#parallax">
			<v-toolbar-title>{{$config.name}}</v-toolbar-title>
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
				<v-btn text @click="github()">登录</v-btn>
			</v-toolbar-items>
		</v-app-bar>
		<v-parallax id="parallax" src="https://bufpay.com/htdocs/img/header.jpg">
			<h1 class="tac mt-12">开源项目捐赠平台</h1>
			<h2 class="tac mt-12">简单方便,上传二维码就可以开通,支持微信支持宝</h2>
			<div class="tac mt-12">
				<v-btn color="primary" rounded to="/qrcode">立即使用</v-btn>
				<v-btn color="success" rounded to="/inu1255/opendonate" class="ml-12">捐赠体验</v-btn>
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
		github() {
			utils.githubLogin();
		},
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
