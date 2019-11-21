<template>
	<div class="i-drawer" :class="{hide:open==null?hide:!open}">
		<slot></slot>
		<div class="i-drawer-btn" @click="toggle()">
			<slot name="btn"></slot>
		</div>
	</div>
</template>
<script>
export default {
	name: "IDrawer",
	props: {
		width: String,
		open: {},
	},
	data() {
		return {
			hide: 0
		}
	},
	computed: {

	},
	methods: {
		toggle() {
			if (this.open == null)
				return this.hide = !this.hide
			this.$emit('update:open', !this.open)
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
.i-drawer {
	.depth;
	height: 100vh;
	transition: transform 0.3s;
	&.hide {
		transform: translateX(-100%);
	}
	.i-drawer-btn {
		position: absolute;
		left: 100%;
		top: 45%;
	}
}
</style>
