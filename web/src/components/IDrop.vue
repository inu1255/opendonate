<template>
	<div class="components-i-drop" @dragover="dragover" @dragleave="dragleave" @dragend="dragleave" @drop="drop">
		<slot></slot>
		<div class="_mask" :style="{backgroundColor:color,display:over?'flex':'none'}">{{tip}}</div>
	</div>
</template>
<script>
export default {
	name: "IDrop",
	props: {
		tip: String,
		mask: String,
		color: String,
		files: Boolean,
	},
	data() {
		return {
			over: false,
		}
	},
	computed: {

	},
	methods: {
		dragover(e) {
			this.over = true;
			e.preventDefault();
		},
		dragleave(e) {
			this.over = false;
		},
		drop(e) {
			this.over = false;
			if (this.files)
				this.$emit('drop', e.dataTransfer.files)
			else
				this.$emit('drop', e.dataTransfer)
			e.preventDefault();
		},
	},
	mounted() {

	},
	components: {

	},
}
</script>
<style lang="less">
.components-i-drop {
	position: relative;
	> ._mask {
		position: absolute;
		align-content: center;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		background: rgba(54, 208, 255, 0.3);
		pointer-events: none;
	}
}
</style>
