<template>
	<component :is="tag" :style="style" @click="$emit('click',$event)">
		<slot></slot>
	</component>
</template>
<script>
export default {
	name: "IScale",
	props: {
		tag: { type: String, default: 'div' },
		origin: { type: String, default: 'bottom' },
	},
	data() {
		return {

		}
	},
	computed: {
		style() {
			return {
				transformOrigin: this.origin,
				transform: `scale(${this.$root.scale || 1})`
			}
		}
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
.i-scale {
}
</style>
