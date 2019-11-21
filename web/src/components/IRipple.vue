<template>
	<div class="i-ripple" :class="{active:pos}" @click="onclick" @mousedown="start" @mouseup="end">
		<slot></slot>
		<div class="i-ripple-mask">
			<div :style="pos"></div>
		</div>
	</div>
</template>
<script>
export default {
	name: "IRipple",
	data() {
		return {
			pos: '',
		}
	},
	computed: {

	},
	methods: {
		onclick(e) {
			this.$emit('click', e);
		},
		start(e) {
			var rect = this.$el.getBoundingClientRect();
			var x = e.clientX - rect.x;
			var y = e.clientY - rect.y;
			var w = Math.max(rect.width, rect.height)
			this.pos = { left: x - w + 'px', top: y - w + 'px', width: w * 2 + 'px', height: w * 2 + 'px' }
		},
		end(e) {
			setTimeout(() => this.pos = '', 300)
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
.i-ripple {
	position: relative;
	display: inline-block;
	transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1), color 1ms;
	cursor: pointer;
	&.active {
		box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
			0px 8px 10px 1px rgba(0, 0, 0, 0.14),
			0px 3px 14px 2px rgba(0, 0, 0, 0.12);
		.i-ripple-mask > div {
			transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
				opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1);
			transform: scale(1);
			opacity: 0.25;
		}
	}
	.i-ripple-mask {
		position: absolute;
		pointer-events: none;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		overflow: hidden;
		> div {
			position: absolute;
			border-radius: 50%;
			background: #fff;
			opacity: 0;
			transform: scale(0);
			transition: opacity 0.1s cubic-bezier(0.4, 0, 0.2, 1);
		}
	}
}
</style>
