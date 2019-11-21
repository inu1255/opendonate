<template>
	<div class="views-app-version">
		<div class="head">
			<img src="../assets/logo.png" alt="">
			<br>
			<h1>券二狗</h1>
			<div class="version">{{version.version}} - {{version.size|traffic(0,1)}}</div>
			<div class="version">更新于: <i-date :value="version.update_at"></i-date>
			</div>
			<br>
			<v-divider></v-divider>
			<br>
			<v-btn @click="download" color="primary">下载安装</v-btn>
		</div>
		<br>
		<v-divider></v-divider>
		<br>
		<div v-if="version.description">
			<h3 class="tac">更新日志</h3>
			<pre>{{version.description}}</pre>
		</div>
		<div class="wx" v-if="wx">
			<img src="../assets/wx.png" alt="">
		</div>
	</div>
</template>
<script>
export default {
	name: "AppVersion",
	data() {
		return {
			version: {
				version: "1.0.0",
				size: 5012,
				update_at: 1554608788000,
				description: ""
			},
			wx: false,
		}
	},
	computed: {

	},
	methods: {
		download() {
			window.open(`/versions/${this.version.version}.apk`)
		}
	},
	async mounted() {
		let data = await this.$get("app/version");
		this.version = data;
	},
	components: {

	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-app-version {
	padding: 5%;
	.head {
		padding-top: 128px;
		text-align: center;
		> img {
			width: 33%;
			border-radius: 20%;
			border: 1px solid #ccc;
		}
		.version {
			color: #999;
		}
	}
	.wx {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		padding: 16px;
	}
}
</style>
