<template>
	<div class="i-slider" :class="{vertical:height}" @click="click">
		<div :style="{height}">
			<div class="line" :style="lineStyle">
				<div class="controller" :class="{active}" v-move="onmove" :style="circleStyle"></div>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	name: "ISlider",
	props: {
		min: { type: Number, default: 0 },
		max: { type: Number, default: 1 },
		step: { type: Number, default: 0.01 },
		color: { type: String, default: "#0D9BFF" },
		bg: { type: String, default: "#DBDBDB" },
		value: Number,
		height: String, // 竖直
		debug: Boolean,
	},
	data() {
		return {
			active: false,
		}
	},
	computed: {
		num() {
			return (this.max - this.min) / this.step;
		},
		percent() {
			return (this.value - this.min) / (this.max - this.min) * 100 || 0
		},
		lineStyle() {
			return {
				background: `${this.bg} linear-gradient(${this.color},${this.color}) no-repeat`,
				backgroundPosition: this.height ? `0% 100%` : `0% 0%`,
				backgroundSize: this.height ? `100% ${this.percent}%` : `${this.percent}% 100%`,
			}
		},
		circleStyle() {
			return {
				background: this.percent ? this.color : '#dbdbdb',
				borderColor: this.percent ? this.color : this.bg,
				[this.height ? 'bottom' : 'left']: this.percent + '%',
			}
		}
	},
	methods: {
		click(e) {
			this.onmove('end', e);
		},
		onmove(step, e) {
			this.active = step != "end";
			if (step == "start") return e.preventDefault();
			var rect = this.$el.firstChild.firstChild.getBoundingClientRect()
			var percent = this.height ? 1 - (e.clientY - rect.y) / rect.height : (e.clientX - rect.x) / rect.width;
			var value
			if (percent > 1) value = this.max;
			else if (percent < 0) value = this.min;
			else value = this.min + Math.floor(percent * this.num) * this.step;
			if (this.value != value) {
				this.$emit('input', value);
				if (step == "end")
					this.$emit('change', value);
			}
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
@line: 2px; // 线宽度
@circle: 10px; // controller 直径
@circle-border: 1px; // 圆边宽
@circle-size: @circle+ @circle-border*2;
@half: (@line - @circle - @circle-border)/2;
.i-slider {
	user-select: none;
	> div {
		padding-top: 0;
		padding-bottom: 0;
		padding-left: @circle-size;
		padding-right: @circle-size;
		height: @circle-size;
		> .line {
			height: @line;
			border-radius: @line;
			position: relative;
			transform: translateY((@circle-size - @line)/2);
			transition: background-size 0.3s;
			> .controller {
				position: absolute;
				width: @circle;
				height: @circle;
				border: @circle-border solid #ccc;
				border-radius: @circle;
				top: @line - @circle-size / 2;
				transform: translateX(@half);
				transition: all 0.3s;
				&.active {
					transform: translateX(@half) scale(1.3);
					transition: transform, background-color, border-color 0.5s;
				}
			}
		}
	}
	&.vertical {
		> div {
			padding-left: 0;
			padding-right: 0;
			padding-top: @circle-size;
			padding-bottom: @circle-size;
			width: unset;
			height: unset;
			text-align: center;
			box-sizing: border-box;
			> .line {
				height: 100%;
				width: @line;
				transform: none;
				display: inline-block;
				> .controller {
					top: unset;
					left: @line - @circle-size / 2;
					transform: translateY(-@half);
					&.active {
						transform: translateY(-@half) scale(1.3);
					}
				}
			}
		}
	}
}
</style>
