<template>
	<div class="i-app-bar" :class="{fixed}">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IAppBar",
	props: {
		fixed: Boolean,
	},
	data() {
		return {

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
.i-app-bar {
	background: @primary;
	color: #fff;
	height: 3rem;
	padding: 0 1rem;
	box-sizing: border-box;
	box-shadow: 0 0 0.2rem #777;
	position: relative;
	overflow-y: hidden;
	overflow-x: auto;
	display: flex;
	align-items: center;
	font-size: 0.8rem;
	> .logo,
	> .logo img {
		border-radius: 100%;
	}
	> .title {
		font-size: 1rem;
		margin-right: 1.5rem;
		color: #fff !important;
	}
	&.fixed {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
		+ * {
			margin-top: 3rem;
		}
	}
	> * {
		margin-right: 0.5rem;
		&:last-child {
			margin-right: 0;
		}
	}
	> a {
		.magic-color;
		white-space: nowrap;
	}
}
</style>
