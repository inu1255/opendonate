<template>
	<div class="i-img" :style="style">
		<transition name="it-fade">
			<div v-if="loading&&i_loading" class="mask">
				<i-icon value="loading" loading color="#1989fa" />
			</div>
		</transition>
		<div class="footer">
			<slot></slot>
		</div>
	</div>
</template>
<script>
import IIcon from './IIcon'
import * as utils from '../common/utils'

export default {
	name: "IImg",
	data: function () {
		return {
			i_loading: false,
			ishover: false,
			i_ratio: 1,
		}
	},
	props: {
		src: String,
		size: { type: String, default: 'contain' },
		loading: Boolean, // 是否显示加载过度效果
	},
	watch: {
		url() {
			if (!this.url) return;
			this.i_loading = true;
			if (this.$el && !this.$el.clientWidth) {
				utils.loadImage(this.url).then(image => {
					this.i_loading = false;
					this.$el.style.minWidth = this.$el.clientHeight / image.naturalHeight * image.naturalWidth + 'px'
				}, () => {
					this.i_loading = false;
				})
			}
		},
	},
	computed: {
		url() {
			var src = (this.hover && this.ishover) ? this.hover : this.src;
			return src || '';
		},
		style() {
			var style = {}
			style.backgroundImage = `url(${this.url})`
			style.backgroundSize = this.size;
			return style;
		},
	},
	methods: {
	},
	mounted() {
		if (this.url && this.$el && !this.$el.clientWidth) {
			utils.loadImage(this.url).then(image => {
				this.i_loading = false;
				this.$el.style.minWidth = this.$el.clientHeight / image.naturalHeight * image.naturalWidth + 'px'
			}, () => {
				this.i_loading = false;
			})
		}
	},
	components: {
		IIcon,
	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-img {
	display: inline-block;
	position: relative;
}
</style>
