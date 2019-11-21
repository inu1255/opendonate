<template>
	<transition name="it-fade">
		<div class="i-modal" v-if="open">
			<div class="i-modal-mask" @click="$emit('update:open',false)"></div>
			<div class="i-modal-wrapper" :style="{background}">
				<slot></slot>
			</div>
		</div>
	</transition>
</template>
<style lang="less">
.i-modal {
	width: 100vw;
	height: 100vh;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	position: fixed;
	z-index: 200;
	overflow: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	background: rgba(127, 127, 127, 0.5);
}
.i-modal-mask {
	background-color: transparent;
	z-index: 10;
	opacity: 0;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 0;
}
.i-modal-wrapper {
	position: relative;
	z-index: 100;
	width: auto;
	display: flex;
	align-items: center;
	flex-direction: column;
	max-width: 100%;
	border-radius: 0.5rem;
}
</style>
<script>
import { pushIndex } from './zindex';
export default {
	props: {
		open: {},
		autofocus: Boolean,
		background: { type: String, default: '' },
	},
	watch: {
		open: {
			immediate: true,
			handler() {
				if (this.open && this.autofocus)
					this.$nextTick(() => {
						pushIndex(this.$el)
						var input = this.$el.querySelector('input')
						input && input.focus();
					})
			}
		}
	}
}
</script>