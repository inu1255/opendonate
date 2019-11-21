<template>
	<div class="i-image-preview" @click="click" @contextmenu.prevent="noop">
		<div class="header" v-if="item&&item.name">{{item.name}}</div>
		<i-icon class="close" name="close" @click.stop="$emit('close',idx)" />
		<img v-if="item" :src="item.src" @load="load">
		<div v-if="value.length>1" class="footer">
			<span v-for="(_,i) in value" :key="i" :class="{active:i==idx}" @click.stop="idx=i"></span>
		</div>
	</div>
</template>
<script>
import { pushIndex } from './zindex';
export default {
	name: "IImagePreview",
	props: {
		value: Array,
	},
	data() {
		return {
			idx: 0,
		}
	},
	computed: {
		item() {
			var item = this.value[this.idx]
			if (typeof item === "string")
				return { src: item }
			return item;
		}
	},
	methods: {
		noop() { },
		load(e) {
			var img = e.target
			var max = { width: this.$el.clientWidth, height: this.$el.clientHeight }
			var size = { width: img.naturalWidth, height: img.naturalHeight }
			utils.contain(size, max)
			img.width = size.width
			img.height = size.height
		},
		click(e) {
			if (this.value.length < 2)
				return this.$emit('close', 0)
			if (e.clientX > window.innerWidth / 2)
				this.idx = (this.idx + 1) % this.value.length
			else
				this.idx = (this.idx + this.value.length - 1) % this.value.length
		},
	},
	mounted() {
		pushIndex(this.$el)
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-image-preview {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	background: rgba(127, 127, 127, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	.close {
		position: absolute;
		right: 0.5rem;
		top: 0.5rem;
		color: #fff;
		font-size: 1.75rem;
	}
	> .header,
	> .footer {
		position: absolute;
		line-height: 2.75rem;
		left: 0;
		right: 0;
		text-align: center;
		background: rgba(0, 0, 0, 0.4);
		color: #fff;
	}
	> .header {
		top: 0;
	}
	> .footer {
		bottom: 0;
		> span {
			display: inline-block;
			width: 0.375rem;
			height: 0.375rem;
			border-radius: 0.375rem;
			border: 0.125rem solid #fff;
			cursor: pointer;
			margin: 0 0.25rem;
			transition: 0.3s background-color;
			&.active {
				background: @primary;
			}
		}
	}
}
</style>
