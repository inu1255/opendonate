<template>
	<div class="i-group" :class="{left,right}" @click="$emit('click',$event)">
		<div>
			<slot></slot>
		</div>
	</div>
</template>
<script>
export default {
	name: "IGroup",
	props: {
		left: Boolean,
		right: Boolean,
	},
	data() {
		return {

		}
	},
	computed: {

	},
	methods: {
		reset() {
			var el = this.$el.firstChild;
			if (this.left) {
				var c = el.firstElementChild
				el.style.paddingLeft = c.clientWidth + 'px';
			}
			if (this.right) {
				var c = el.lastElementChild
				el.style.paddingRight = c.clientWidth + 'px';
			}
		}
	},
	mounted() {
		if (this.$el.clientWidth > 0)
			return this.reset()
		this.tick = setInterval(() => {
			if (this.$el.clientWidth > 0) {
				clearInterval(this.tick)
				this.reset()
			}
		}, 100);
	},
	beforeDestroy() {
		if (this.tick) clearInterval(this.tick)
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-group {
	// box-sizing: border-box;
	> div {
		position: relative;
	}
	&.left > div > :first-child {
		position: absolute;
		top: 0;
		bottom: 0;
		display: inline-block;
		left: 0;
	}
	&.right > div > :last-child {
		position: absolute;
		top: 0;
		bottom: 0;
		display: inline-block;
		right: 0;
	}
}
</style>
