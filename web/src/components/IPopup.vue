<template>
	<transition name="it-fade">
		<div v-show="zMode||show" class="i-popup" :class="{'z-mode':zMode}" :style="style">
			<div class="mask" @click="show=false" @mousedown="onmousedown" @contextmenu.prevent="set"></div>
			<slot></slot>
		</div>
	</transition>
</template>
<script>
import { pushIndex } from './zindex';
export default {
	name: "IPopup",
	props: {
		open: { default: false },
		pos: { type: String, default: 'bottom' },
		menu: Boolean,
		center: Boolean,
		right: Boolean, // 右键移动模式
		zMode: Boolean, // 不会display:none,对于一些需要通过宽度来初始化的内容有用
		aim: {}, // 目标元素
	},
	data() {
		return {
			show: false,
			rect: {
				left: 0,
			}
		}
	},
	computed: {
		style() {
			var rect = this.rect;
			var style = {}
			for (var k in rect) {
				var v = rect[k]
				style[k] = v + 'px'
			}
			return style;
		}
	},
	watch: {
		open(e) {
			if (!this.show || e != true)
				this.set(e)
		},
		show() {
			if (this.show != !!this.open)
				this.$emit('update:open', this.show)
			if (this.show) {
				var mask = this.$el.firstElementChild
				if (mask) mask.style.pointerEvents = ''
				if (this.zMode) this.$el.style.opacity = 1;
				pushIndex(this.$el)
			} else if (this.zMode) {
				this.$el.style.zIndex = -1;
				this.$el.style.opacity = 0;
			}
		}
	},
	methods: {
		onmousedown(e) {
			if (!this.right && e.buttons == 2) { // 右键
				this.show = false;
				e.target.style.pointerEvents = 'none'
				setTimeout(function () {
					e.target.style.pointerEvents = ''
				})
			}
		},
		_reset(r) {
			if (r) this.rect = r;
			this.$nextTick(() => {
				var rect = this.$el.getBoundingClientRect()
				if (rect.right > window.innerWidth) {
					if (this.rect.left != null) this.rect.left = window.innerWidth - rect.width;
					else this.rect.right = 0;
				}
				if (rect.left < 0) {
					if (this.rect.left != null) this.rect.left = 0;
					else this.rect.right = rect.width;
				}
				if (rect.bottom > window.innerHeight) {
					if (this.rect.top != null) this.rect.top = window.innerHeight - rect.height;
					else this.rect.bottom = 0;
				}
				if (rect.top < 0) {
					if (this.rect.top != null) this.rect.top = 0;
					else this.rect.right = rect.height;
				}
			})
		},
		_horizontal(rect) {
			if (this.center) {
				this.rect.left = rect.left + (rect.width - this.$el.clientWidth) / 2
			} else if (rect.left > window.innerWidth / 2) {
				this.rect.right = window.innerWidth - rect.right;
			} else {
				this.rect.left = rect.left;
			}
			this._reset()
		},
		/**
		 * @param {Element} el
		 */
		pos_bottom(el, x, y) {
			var rect = el.getBoundingClientRect()
			this.rect = { top: rect.top + rect.height }
			this._horizontal(rect)
		},
		/**
		 * @param {Element} el
		 */
		pos_top(el, x, y) {
			var rect = el.getBoundingClientRect()
			this.rect = { bottom: window.innerHeight - rect.top }
			this._horizontal(rect)
		},
		/**
		 * @param {Element} el
		 */
		pos_left_bottom(el, x, y) {
			var rect = el.getBoundingClientRect()
			this.rect = { top: rect.top, right: window.innerWidth - rect.left }
			this._reset()
		},
		/**
		 * @param {Element} el
		 */
		pos_left_top(el, x, y) {
			var rect = el.getBoundingClientRect()
			this.rect = { bottom: window.innerHeight - rect.bottom, right: window.innerWidth - rect.left }
			this._reset()
		},
		set(e) {
			if (!e) return this.show = false
			this.show = true;
			this.$nextTick(() => {
				var target = this.aim || e.currentTarget;
				if (!this.menu && target && this.pos) {
					this['pos_' + this.pos.replace(/-/g, '_')](target, x, y)
					return;
				}
				var x = e.clientX || e.x || 0;
				var y = e.clientY || e.y || 0;
				var w = this.$el.clientWidth;
				var h = this.$el.clientHeight;
				if (this.center)
					x -= w / 2;
				this._reset({ left: x, top: y });
			})
		}
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-popup {
	position: fixed;
	background: #fff;
	box-shadow: 0 0.3rem 0.6rem 0 rgba(199, 199, 199, 0.6);
	border-radius: 1px;
	&.z-mode {
		z-index: -1;
		opacity: 0;
	}
	> .mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}
	> :last-child {
		position: relative;
		z-index: 1;
	}
	> ul {
		padding: 0;
		margin: 0;
		list-style: none;
		> li {
			padding: 0.2em 0.5em;
			word-break: keep-all;
			cursor: pointer;
		}
	}
}
</style>
