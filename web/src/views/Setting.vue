<template>
	<div class="views-setting">
		<i-button v-show="$user.lvl<2" class="blue" @click="jd_dialog=true">设置京东cookie</i-button>
		<i-modal :open.sync="jd_dialog">
			<i-input v-model="jdcookie" placeholder="京东cookie"></i-input>
			<br>
			<i-button class="blue" @click="setJD()">保存</i-button>
		</i-modal>
	</div>
</template>
<script>
export default {
	name: "Setting",
	data() {
		return {
			jd_dialog: false,
			jdcookie: '',
		}
	},
	computed: {

	},
	methods: {
		async setJD() {
			if (!this.jdcookie) return this.$toast.error('cookie不允许为空')
			await this.$post('material/set', { jd: this.jdcookie });
			this.$toast.success('设置成功')
			this.jd_dialog = false;
		}
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.views-setting {
	padding: 1em;
}
</style>
