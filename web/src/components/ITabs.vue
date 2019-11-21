<template>
	<div class="i-tabs" :class="{radius,[float]:true}" @mouseover="mouseover" @mouseleave="mouseleave" @click="click">
		<div class="flag" :style="{backgroundColor:color}"></div>
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "ITabs",
	props: {
		vertical: Boolean,
		color: { default: '#0076ff' },
		float: { String, default: 'left' },
		value: Number,
		radius: Boolean,
		preview: Boolean,
		detect: Boolean, // 自动检测 active class
	},
	data() {
		return {
			hover: -1,
			v: -1,
		}
	},
	computed: {
		active() {
			if (this.hover >= 0) return this.hover;
			return this.v;
		}
	},
	watch: {
		value: {
			immediate: true,
			handler() {
				if (this.value != null) this.v = this.value + 1;
			}
		},
		active(v, old) {
			this.render(v, old)
		},
	},
	methods: {
		mouseover(e) {
			if (!this.preview) return;
			var p = e.target;
			while (p && p.parentElement != this.$el) p = p.parentElement;
			if (!p) return
			if (p.parentElement != this.$el) return;
			for (var i = 1; i < this.$el.children.length; i++) {
				var el = this.$el.children[i];
				if (p == el)
					return this.hover = i;
			}
		},
		mouseleave() {
			this.hover = -1;
		},
		click(e) {
			if (this.detect)
				return this.setActive();
			for (var i = 1; i < this.$el.children.length; i++) {
				var el = this.$el.children[i];
				if (e.target == el) {
					this.v = i;
					this.$emit('input', i - 1)
					return
				}
			}
		},
		setActive() {
			if (this.value != null) return;
			for (var i = 1; i < this.$el.children.length; i++) {
				var el = this.$el.children[i];
				if (el.classList.contains('active'))
					return this.v = i;
			}
			this.v = 1;
			return -1;
		},
		render(v, old) {
			var idx = this.active
			if (/left|right/.test(this.float)) {
				if (idx < 0) this.flag.style.top = -100 + 'px';
				else {
					var c = this.$el.children[idx];
					if (!this.detect) {
						var oc = this.$el.children[old];
						if (oc) oc.classList.remove('active')
						if (!c.classList.contains('active')) c.classList.add('active')
					}
					var pr = this.$el.getBoundingClientRect();
					var cr = c.getBoundingClientRect();
					this.flag.style.top = (cr.top - pr.top) + 'px';
					this.flag.style.height = cr.height + 'px';
				}
			} else {
				if (idx < 0) this.flag.style.left = -100 + 'px';
				else {
					var c = this.$el.children[idx];
					if (!this.detect) {
						var oc = this.$el.children[old];
						if (oc) oc.classList.remove('active')
						if (!c.classList.contains('active')) c.classList.add('active')
					}
					var pr = this.$el.getBoundingClientRect();
					var cr = c.getBoundingClientRect();
					this.flag.style.left = (cr.left - pr.left) + 'px';
					this.flag.style.width = cr.width + 'px';
				}
			}
		}
	},
	mounted() {
		this.flag = this.$el.querySelector('.flag')
		this.value == null ? this.setActive() : this.render()
	},
	components: {

	},
}
</script>
<style lang="less">
@import "~@/styles/define.less";
@size: 0.2rem;
.i-tabs {
	position: relative;
	> .flag {
		position: absolute;
		width: @size;
		height: @size;
		border-radius: 0.1rem;
		transition: all 0.3s;
	}
	> * {
		cursor: pointer;
	}
	&.top > .flag {
		top: 0;
		left: -6.25rem;
	}
	&.right > .flag {
		right: 0;
		top: -6.25rem;
	}
	&.bottom > .flag {
		bottom: 0;
		left: -6.25rem;
	}
	&.left > .flag {
		left: 0;
		top: -6.25rem;
	}
	&.radius {
		&.top > .flag {
			border-top-left-radius: 0;
			border-bottom-left-radius: @size;
			border-top-right-radius: 0;
			border-bottom-right-radius: @size;
		}
		&.left > .flag {
			border-top-left-radius: @size;
			border-bottom-left-radius: @size;
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}
		&.bottom > .flag {
			border-top-left-radius: @size;
			border-bottom-left-radius: 0;
			border-top-right-radius: @size;
			border-bottom-right-radius: 0;
		}
		&.left > .flag {
			border-top-left-radius: 0;
			border-bottom-left-radius: 0;
			border-top-right-radius: @size;
			border-bottom-right-radius: @size;
		}
	}
}
</style>
